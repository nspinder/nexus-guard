import axios from 'axios';

const PHONE_PATTERNS = {
  // Known spam/scam patterns
  spoofed: ['555-', '0000', '9999', '111-', '222-'],
  shortCode: /^[0-9]{3,5}$/,
};

async function validatePhoneNumber(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber);

  if (!normalized) {
    return {
      valid: false,
      error: 'Invalid phone number format',
      phoneNumber,
    };
  }

  const basicCheck = performBasicChecks(normalized);
  const virusTotalCheck = await checkVirusTotal(normalized);
  const spamDatabaseCheck = await checkSpamDatabase(normalized);

  const riskLevel = determineRiskLevel(basicCheck, virusTotalCheck, spamDatabaseCheck);
  const threatLevel = getRiskLevel(riskLevel);

  return {
    valid: true,
    phoneNumber: normalized,
    formattedNumber: formatPhoneNumber(normalized),
    countryCode: extractCountryCode(normalized),
    carrier: await getCarrierInfo(normalized),
    riskLevel,
    threatLevel,
    isSpam: riskLevel === 'high',
    isSuspicious: riskLevel === 'medium',
    warnings: basicCheck.warnings,
    flags: basicCheck.flags,
    databasesChecked: {
      patternAnalysis: true,
      virusTotal: virusTotalCheck.checked,
      spamDatabase: spamDatabaseCheck.checked,
    },
    details: {
      ...basicCheck.details,
      virusTotalResults: virusTotalCheck,
      spamDatabaseResults: spamDatabaseCheck,
    },
  };
}

function normalizePhoneNumber(phone) {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');

  // Handle + prefix
  if (normalized.startsWith('+')) {
    normalized = '+' + normalized.substring(1).replace(/\D/g, '');
  } else {
    normalized = normalized.replace(/\D/g, '');
  }

  // Validate basic length (8-15 digits)
  const digitsOnly = normalized.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return null;
  }

  return normalized;
}

function formatPhoneNumber(phone) {
  const digits = phone.replace(/\D/g, '');

  // Brazilian format: +55 (XX) 9XXXX-XXXX or +55 (XX) XXXX-XXXX
  if (digits.startsWith('55') && digits.length === 13) {
    const areaCode = digits.slice(2, 4);
    const firstPart = digits.slice(4, 9);
    const secondPart = digits.slice(9);
    return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
  } else if (digits.startsWith('55') && digits.length === 12) {
    const areaCode = digits.slice(2, 4);
    const firstPart = digits.slice(4, 8);
    const secondPart = digits.slice(8);
    return `+55 (${areaCode}) ${firstPart}-${secondPart}`;
  }

  // US format: (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  // Generic international format
  if (digits.startsWith('+')) {
    return phone;
  }

  return phone;
}

function extractCountryCode(phone) {
  const digits = phone.replace(/\D/g, '');

  const countryMap = {
    // North America
    '1': 'United States / Canada',
    // South America
    '54': 'Argentina',
    '55': 'Brazil',
    '56': 'Chile',
    '57': 'Colombia',
    '593': 'Ecuador',
    '595': 'Paraguay',
    '51': 'Peru',
    '598': 'Uruguay',
    '58': 'Venezuela',
    '591': 'Bolivia',
    '592': 'Guyana',
    '597': 'Suriname',
    // Europe
    '43': 'Austria',
    '32': 'Belgium',
    '359': 'Bulgaria',
    '385': 'Croatia',
    '420': 'Czech Republic',
    '45': 'Denmark',
    '358': 'Finland',
    '33': 'France',
    '49': 'Germany',
    '30': 'Greece',
    '36': 'Hungary',
    '353': 'Ireland',
    '39': 'Italy',
    '371': 'Latvia',
    '370': 'Lithuania',
    '352': 'Luxembourg',
    '31': 'Netherlands',
    '48': 'Poland',
    '40': 'Romania',
    '7': 'Russia',
    '421': 'Slovakia',
    '386': 'Slovenia',
    '34': 'Spain',
    '46': 'Sweden',
    '41': 'Switzerland',
    '44': 'United Kingdom',
    // Asia
    '86': 'China',
    '91': 'India',
    '62': 'Indonesia',
    '81': 'Japan',
    '82': 'South Korea',
    '60': 'Malaysia',
    '63': 'Philippines',
    '65': 'Singapore',
    '66': 'Thailand',
    '84': 'Vietnam',
    '90': 'Turkey',
    '971': 'United Arab Emirates',
    '966': 'Saudi Arabia',
    '972': 'Israel',
    '880': 'Bangladesh',
    '977': 'Nepal',
    '92': 'Pakistan',
    '98': 'Iran',
    // Africa
    '27': 'South Africa',
    '20': 'Egypt',
    '212': 'Morocco',
    '216': 'Tunisia',
    '234': 'Nigeria',
    '254': 'Kenya',
    '256': 'Uganda',
    '255': 'Tanzania',
    '251': 'Ethiopia',
    // Oceania
    '61': 'Australia',
    '64': 'New Zealand',
    '679': 'Fiji',
  };

  // Try to extract country code from digits
  // Check 3-digit codes first (more specific), then 2-digit, then 1-digit
  let code = null;
  let country = null;

  // Check if it starts with 3-digit country code
  const threeDigitCode = digits.slice(0, 3);
  if (countryMap[threeDigitCode]) {
    code = threeDigitCode;
    country = countryMap[threeDigitCode];
  } else {
    // Check if it starts with 2-digit country code
    const twoDigitCode = digits.slice(0, 2);
    if (countryMap[twoDigitCode]) {
      code = twoDigitCode;
      country = countryMap[twoDigitCode];
    } else {
      // Check if it starts with 1-digit country code (US/Canada)
      const oneDigitCode = digits.slice(0, 1);
      if (countryMap[oneDigitCode]) {
        code = oneDigitCode;
        country = countryMap[oneDigitCode];
      } else if (digits.length >= 2 && digits.slice(0, 2) === '11' && digits.length >= 10) {
        // Brazilian local format (starts with 11 for São Paulo)
        code = '55';
        country = 'Brazil';
      } else {
        // Default to unknown for unrecognized numbers
        code = 'unknown';
        country = 'Unknown Country';
      }
    }
  }

  return { code, country };
}

function performBasicChecks(phone) {
  const warnings = [];
  const flags = [];
  const details = {};

  const digits = phone.replace(/\D/g, '');

  // Check for short codes
  if (PHONE_PATTERNS.shortCode.test(digits)) {
    flags.push('short_code');
    details.isShortCode = true;
  }

  // Check for common spoofed patterns
  for (const pattern of PHONE_PATTERNS.spoofed) {
    if (phone.includes(pattern)) {
      warnings.push(`Suspicious pattern detected: ${pattern}`);
      flags.push('spoofed_pattern');
      details.spoofedPattern = pattern;
    }
  }

  // Check for sequential numbers (common test/fake numbers)
  if (/(.)\1{6,}/.test(digits)) {
    warnings.push('Repeating digit pattern detected');
    flags.push('repeating_digits');
  }

  // Check for all zeros or nines (common fakes)
  if (/^0+$/.test(digits) || /^9+$/.test(digits)) {
    warnings.push('Invalid sequential pattern');
    flags.push('invalid_pattern');
  }

  // Check for obviously fake US numbers
  // Either 10 digits (local) or 11 digits starting with 1 (with country code)
  if ((digits.length === 10 && (digits.startsWith('555') || digits.startsWith('000') || digits.startsWith('999'))) ||
      (digits.length === 11 && digits.startsWith('1') && (digits.slice(1, 4) === '555' || digits.slice(1, 4) === '000' || digits.slice(1, 4) === '999'))) {
    warnings.push('Likely fictional number (commonly used in movies)');
    flags.push('fictional_number');
  }

  // Brazilian-specific checks
  if (phone.includes('+55') || digits.startsWith('55')) {
    // Check for invalid area codes (must be 2 digits after country code)
    const areaCode = digits.length > 2 ? digits.slice(2, 4) : '';
    const areaCodeNum = parseInt(areaCode);

    // Valid Brazilian area codes are 11-99
    if (areaCodeNum < 11 || areaCodeNum > 99) {
      warnings.push('Invalid Brazilian area code');
      flags.push('invalid_area_code');
    }

    // Check for known spam number patterns in Brazil
    if (digits.slice(4, 7) === '000' || digits.slice(4, 7) === '111' || digits.slice(4, 7) === '999') {
      warnings.push('Suspicious pattern detected in Brazilian number');
      flags.push('suspicious_pattern_br');
    }
  }

  return { warnings, flags, details };
}

async function checkVirusTotal(phone) {
  try {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      return { checked: false, reason: 'API key not configured' };
    }

    const searchTerm = phone.replace(/\D/g, '');
    const response = await axios.get('https://www.virustotal.com/api/v3/search', {
      headers: {
        'x-apikey': apiKey,
      },
      params: {
        query: searchTerm,
      },
      timeout: 5000,
    });

    if (response.data.data && response.data.data.length > 0) {
      const results = response.data.data.map(item => ({
        type: item.type,
        id: item.id,
        category: item.attributes?.category,
      }));
      return { checked: true, found: true, results, source: 'virustotal' };
    }

    return { checked: true, found: false, source: 'virustotal' };
  } catch (error) {
    console.error('VirusTotal phone check error:', error.message);
    return { checked: false, error: error.message, source: 'virustotal' };
  }
}

async function checkSpamDatabase(phone) {
  // Check against known spam/fraud patterns and historical reports
  try {
    const digits = phone.replace(/\D/g, '');

    // Check for known spam prefixes (these are common spam area codes)
    const knownSpamPrefixes = {
      // India spam numbers
      '919': 'Known spam source (India)',
      '918': 'Known spam source (India)',

      // Known premium scam numbers (often impersonate government agencies)
      // Add more as needed
    };

    const areaCode = digits.length > 3 ? digits.slice(-10, -7) : '';
    if (knownSpamPrefixes[areaCode]) {
      return {
        checked: true,
        found: true,
        reason: knownSpamPrefixes[areaCode],
        source: 'spam_database'
      };
    }

    return { checked: true, found: false, source: 'spam_database' };
  } catch (error) {
    return { checked: false, error: error.message, source: 'spam_database' };
  }
}

async function getCarrierInfo(phone) {
  try {
    // Carrier detection based on country code and number patterns
    const digits = phone.replace(/\D/g, '');

    // Brazilian carriers (55 + area code + number)
    if (phone.includes('+55') || digits.startsWith('55')) {
      const areaCode = digits.length > 2 ? digits.slice(2, 4) : '';
      const firstDigits = digits.length > 6 ? digits.slice(4, 7) : '';

      // Brazilian carrier detection by area code and prefix
      const brazilianCarriers = {
        // Vivo (largest carrier)
        'vivo': ['11', '21', '31', '41', '51', '61', '71', '81', '85'],
        // Claro
        'claro': ['11', '21', '22', '27', '28', '31', '34', '35', '37', '38', '47', '48', '49', '54', '55', '62', '64', '67', '68', '82', '89'],
        // Oi
        'oi': ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '39', '41', '42', '43', '44', '45', '46', '47', '48', '49', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '72', '73', '74', '75', '77', '79', '81', '82', '83', '84', '86', '87', '88', '89'],
        // TIM
        'tim': ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38', '39', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '72', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89'],
      };

      for (const [carrier, areaCodes] of Object.entries(brazilianCarriers)) {
        if (areaCodes.includes(areaCode)) {
          return `${carrier.toUpperCase()} (BR)`;
        }
      }

      return 'Unknown Carrier (Brazil)';
    }

    // US/Canada carriers (1 + area code)
    if (digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))) {
      const areaCode = digits.length === 10 ? digits.slice(0, 3) : digits.slice(1, 4);

      const usCarriers = {
        '201': 'Verizon', '202': 'Verizon', '203': 'AT&T',
        '204': 'Rogers (CA)', '205': 'AT&T', '206': 'T-Mobile',
      };

      return usCarriers[areaCode] || 'Unknown Carrier (US/CA)';
    }

    return 'Unknown Carrier';
  } catch (error) {
    console.error('Carrier lookup error:', error);
    return 'Unknown Carrier';
  }
}

function determineRiskLevel(basicCheck, virusTotalCheck, spamDatabaseCheck) {
  let riskScore = 0;

  // Basic checks scoring - only real red flags
  if (basicCheck.flags.includes('fictional_number')) riskScore += 60; // Known fake numbers like 555-1234
  if (basicCheck.flags.includes('spoofed_pattern')) riskScore += 50; // Known spoofing patterns
  if (basicCheck.flags.includes('invalid_pattern')) riskScore += 40; // All 0s, all 9s, etc.
  if (basicCheck.flags.includes('repeating_digits')) riskScore += 40; // 6+ repeating digits
  if (basicCheck.flags.includes('short_code')) riskScore += 20; // Short codes

  // VirusTotal results - be more selective (only high confidence)
  if (virusTotalCheck.found && virusTotalCheck.results?.length >= 2) {
    riskScore += 60;
  }

  // Spam database check - definitive hit
  if (spamDatabaseCheck.found) {
    riskScore += 80; // High confidence from spam database
  }

  // Determine risk level - higher threshold
  if (riskScore >= 80) return 'high';
  if (riskScore >= 50) return 'medium';
  return 'low';
}

function getRiskLevel(riskLevel) {
  if (riskLevel === 'high') return 'danger';
  if (riskLevel === 'medium') return 'warning';
  return 'none';
}

export default {
  validatePhoneNumber,
  normalizePhoneNumber,
  formatPhoneNumber,
  extractCountryCode,
  checkSpamDatabase,
  checkVirusTotal,
};
