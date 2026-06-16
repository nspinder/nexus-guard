import crypto from 'crypto';
import axios from 'axios';

const HIBP_API_URL = 'https://api.pwnedpasswords.com/range/';
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', '111111', 'iloveyou', 'master',
  'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
];

async function checkPasswordBreach(password) {
  // Check against common passwords first (fast)
  const isCommon = COMMON_PASSWORDS.includes(password.toLowerCase());

  // Check password strength
  const strength = analyzePasswordStrength(password);

  // Check against HIBP API (Have I Been Pwned)
  const hibpResult = await checkHIBP(password);

  // Determine overall risk
  const riskLevel = determineRiskLevel(isCommon, strength, hibpResult);
  const threatLevel = getRiskLevel(riskLevel);

  return {
    password: '****' + password.slice(-2), // Show only last 2 chars
    isBreach: hibpResult.isBreach,
    breachCount: hibpResult.breachCount,
    isCommon,
    commonRank: getCommonPasswordRank(password),
    strength: strength.score,
    strengthLevel: strength.level,
    strengthDetails: strength.details,
    riskLevel,
    threatLevel,
    recommendations: generateRecommendations(strength, isCommon, hibpResult),
    details: {
      hibp: hibpResult,
      strength: strength.details,
    },
  };
}

function analyzePasswordStrength(password) {
  const details = {
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    length: password.length,
    isSequential: /(.)\1{2,}|012|123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password),
  };

  let score = 0;

  // Length scoring (most important)
  if (details.length >= 16) score += 40;
  else if (details.length >= 12) score += 30;
  else if (details.length >= 10) score += 20;
  else if (details.length >= 8) score += 10;
  else score += 5;

  // Character variety
  if (details.hasLowercase) score += 10;
  if (details.hasUppercase) score += 10;
  if (details.hasNumbers) score += 10;
  if (details.hasSpecialChars) score += 20;

  // Penalties
  if (details.isSequential) score -= 20;

  score = Math.max(0, Math.min(100, score)); // Clamp 0-100

  let level;
  if (score < 30) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else level = 'strong';

  return { score, level, details };
}

async function checkHIBP(password) {
  try {
    // Hash the password with SHA-1
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // Query HIBP API with prefix (privacy-respecting)
    const response = await axios.get(`${HIBP_API_URL}${prefix}`, {
      headers: {
        'User-Agent': 'NexusGuard-PasswordChecker',
      },
      timeout: 5000,
    });

    // Search for our password in the response
    const hashes = response.data.split('\r\n');
    const match = hashes.find(hash => hash.startsWith(suffix));

    if (match) {
      const count = parseInt(match.split(':')[1]);
      return {
        checked: true,
        isBreach: true,
        breachCount: count,
        message: `This password was found in ${count} data breaches. Change it immediately.`,
      };
    }

    return {
      checked: true,
      isBreach: false,
      breachCount: 0,
      message: 'Password not found in known breaches (good!)',
    };
  } catch (error) {
    console.error('HIBP check error:', error);
    return {
      checked: false,
      error: error.message,
      message: 'Unable to check against breach database',
    };
  }
}

function getCommonPasswordRank(password) {
  const index = COMMON_PASSWORDS.indexOf(password.toLowerCase());
  if (index === -1) return null;
  return index + 1; // 1-based rank
}

function determineRiskLevel(isCommon, strength, hibpResult) {
  let riskScore = 0;

  // Common password check
  if (isCommon) riskScore += 50;

  // Strength check
  if (strength.level === 'weak') riskScore += 40;
  else if (strength.level === 'fair') riskScore += 20;
  else if (strength.level === 'good') riskScore += 5;

  // Breach check
  if (hibpResult.isBreach) {
    riskScore += Math.min(50, hibpResult.breachCount * 2); // Cap at 50
  }

  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

function getRiskLevel(riskLevel) {
  if (riskLevel === 'high') return 'danger';
  if (riskLevel === 'medium') return 'warning';
  return 'none';
}

function generateRecommendations(strength, isCommon, hibpResult) {
  const recommendations = [];

  // HIBP recommendations
  if (hibpResult.isBreach) {
    recommendations.push('⚠️ CRITICAL: Change this password immediately - found in data breaches');
  }

  // Common password recommendations
  if (isCommon) {
    recommendations.push('This is a very common password - attackers try it frequently');
  }

  // Strength recommendations
  if (strength.details.length < 12) {
    recommendations.push('Use at least 12 characters for better security');
  }

  if (!strength.details.hasSpecialChars) {
    recommendations.push('Add special characters (!@#$%^&*) for stronger security');
  }

  if (!strength.details.hasUppercase || !strength.details.hasLowercase) {
    recommendations.push('Mix uppercase and lowercase letters');
  }

  if (!strength.details.hasNumbers) {
    recommendations.push('Include numbers in your password');
  }

  if (strength.details.isSequential) {
    recommendations.push('Avoid sequential patterns (abc, 123, etc.)');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ This is a strong, unique password. Well done!');
  }

  return recommendations;
}

export default {
  checkPasswordBreach,
  analyzePasswordStrength,
};
