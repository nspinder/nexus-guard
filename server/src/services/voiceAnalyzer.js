const SCAM_PHRASES = [
  // Urgency tactics
  'act now', 'immediately', 'right away', 'don\'t wait', 'emergency',
  'urgent', 'quickly', 'hurry', 'limited time', 'expires',

  // Authority impersonation
  'officer', 'agent', 'government', 'irs', 'police', 'federal',
  'official', 'representative', 'administrator', 'manager',

  // Pressure tactics
  'you must', 'you have to', 'you need to', 'no choice', 'required',
  'mandatory', 'or else', 'or your', 'will be', 'will freeze',

  // Information gathering
  'confirm your', 'verify your', 'update your', 'provide your',
  'account number', 'social security', 'credit card', 'password',
  'pin code', 'verification code', 'date of birth',

  // Financial threats
  'arrest', 'lawsuit', 'legal action', 'tax evasion', 'fraud',
  'fine', 'penalty', 'debt', 'payment', 'wire transfer', 'gift card',
];

const DEEPFAKE_INDICATORS = [
  // Audio artifacts
  'robotic', 'synthetic', 'artificial', 'unnatural',
  'metallic', 'distorted', 'glitchy', 'stuttering',

  // Unusual patterns
  'monotone', 'flat affect', 'no emotion', 'emotionless',
  'strange pauses', 'awkward silence', 'uneven rhythm',
];

async function analyzeVoiceCall(anthropic, transcription, audioMetadata = {}) {
  const analysis = {
    transcription,
    scamIndicators: [],
    deepfakeRisk: { score: 0, indicators: [] },
    voicePatterns: {},
    suspiciousFactors: [],
    overallRiskScore: 0,
  };

  // Analyze for scam language
  const scamLanguageAnalysis = analyzeScamLanguage(transcription);
  analysis.scamIndicators = scamLanguageAnalysis.indicators;
  analysis.suspiciousFactors.push(...scamLanguageAnalysis.factors);

  // Analyze for deepfake indicators in transcription
  const deepfakeAnalysis = analyzeDeepfakeIndicators(transcription, audioMetadata);
  analysis.deepfakeRisk = deepfakeAnalysis;
  analysis.suspiciousFactors.push(...deepfakeAnalysis.indicators);

  // Analyze voice patterns
  analysis.voicePatterns = analyzeVoicePatterns(transcription, audioMetadata);

  // Use Claude for additional context analysis
  try {
    const claudeAnalysis = await performClaudeAnalysis(anthropic, transcription);
    analysis.claudeAnalysis = claudeAnalysis;
    analysis.suspiciousFactors.push(...claudeAnalysis.warnings);
  } catch (error) {
    console.error('Claude analysis error:', error);
  }

  // Calculate overall risk
  analysis.overallRiskScore = calculateRiskScore(analysis);
  analysis.threatLevel = getThreatLevel(analysis.overallRiskScore);
  analysis.recommendation = getRecommendation(analysis);

  return analysis;
}

function analyzeScamLanguage(transcription) {
  const text = transcription.toLowerCase();
  const indicators = [];
  const factors = [];

  // Check for scam phrases
  const matchedPhrases = new Set();
  SCAM_PHRASES.forEach(phrase => {
    if (text.includes(phrase)) {
      matchedPhrases.add(phrase);
    }
  });

  indicators.push(...Array.from(matchedPhrases));

  // Analyze phrase frequency and patterns
  if (matchedPhrases.size >= 5) {
    factors.push('Multiple scam phrases detected');
  }

  if (text.includes('act now') || text.includes('immediately')) {
    factors.push('High-pressure urgency tactics detected');
  }

  if (text.includes('confirm your') || text.includes('verify your')) {
    factors.push('Information gathering attempt detected');
  }

  if (text.includes('officer') || text.includes('government') || text.includes('irs')) {
    factors.push('Authority impersonation suspected');
  }

  // Check for unusual capitalization (common in scam messages)
  const allCapsWords = text.split(/\s+/).filter(word =>
    word.length > 1 && word === word.toUpperCase()
  ).length;

  if (allCapsWords > 5) {
    factors.push('Excessive capitalization detected');
  }

  return { indicators: Array.from(matchedPhrases), factors };
}

function analyzeDeepfakeIndicators(transcription, audioMetadata) {
  const text = transcription.toLowerCase();
  const indicators = [];
  let score = 0;

  // Check for deepfake-related keywords
  DEEPFAKE_INDICATORS.forEach(indicator => {
    if (text.includes(indicator)) {
      indicators.push(indicator);
      score += 10;
    }
  });

  // Analyze audio metadata for signs of deepfake
  if (audioMetadata) {
    // Check for unusual audio characteristics
    if (audioMetadata.backgroundNoise === 'none' || audioMetadata.backgroundNoise === 'minimal') {
      // Too clean audio can indicate synthesis
      indicators.push('Unusually clean audio (minimal background noise)');
      score += 5;
    }

    if (audioMetadata.quality === 'high') {
      // But very high quality can also be suspicious
      indicators.push('Unusually high audio quality');
      score += 3;
    }
  }

  // Check for speech patterns that might indicate text-to-speech
  const sentences = transcription.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length > 0) {
    const avgWordCount = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    if (avgWordCount < 5) {
      indicators.push('Short, choppy sentences (possible text-to-speech)');
      score += 8;
    }
  }

  return {
    score: Math.min(100, score),
    risk: score > 30 ? 'medium' : score > 60 ? 'high' : 'low',
    indicators,
  };
}

function analyzeVoicePatterns(transcription, audioMetadata) {
  const patterns = {
    filler_words: 0,
    hesitation_markers: 0,
    repetitions: 0,
    natural_speech_indicators: [],
  };

  // Count filler words (um, uh, like, you know)
  const fillers = transcription.match(/\b(um|uh|like|you know|basically|literally|just)\b/gi) || [];
  patterns.filler_words = fillers.length;

  // Count hesitations
  const hesitations = transcription.match(/\.\.\.|—|-{2,}|…/g) || [];
  patterns.hesitation_markers = hesitations.length;

  // Detect repetitions (sign of pressure or deception)
  const words = transcription.toLowerCase().split(/\s+/);
  const wordCounts = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  patterns.repetitions = Object.values(wordCounts).filter(count => count > 3).length;

  // Assess naturalness
  if (patterns.filler_words > 5) {
    patterns.natural_speech_indicators.push('Natural conversational patterns detected');
  } else if (patterns.filler_words === 0) {
    patterns.natural_speech_indicators.push('No filler words - unusually polished');
  }

  if (patterns.hesitation_markers > 3) {
    patterns.natural_speech_indicators.push('Frequent hesitations - may indicate uncertainty or deception');
  }

  return patterns;
}

async function performClaudeAnalysis(anthropic, transcription) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze this phone call transcript for scam indicators, deepfake signs, and suspicious behavior. Be specific and concise.\n\nTranscript:\n${transcription}\n\nProvide:\n1. Scam warning signs\n2. Deepfake/synthetic voice indicators\n3. Overall assessment`,
        },
      ],
    });

    const analysis = message.content[0].text;
    const warnings = [];

    // Extract specific concerns
    if (analysis.toLowerCase().includes('scam')) warnings.push('Claude detected scam indicators');
    if (analysis.toLowerCase().includes('suspicious')) warnings.push('Claude detected suspicious behavior');
    if (analysis.toLowerCase().includes('deepfake')) warnings.push('Claude detected deepfake patterns');
    if (analysis.toLowerCase().includes('synthetic')) warnings.push('Claude detected potential synthetic voice');

    return {
      analysis,
      warnings,
    };
  } catch (error) {
    console.error('Claude analysis error:', error);
    return {
      analysis: null,
      warnings: ['Unable to perform AI analysis'],
    };
  }
}

function calculateRiskScore(analysis) {
  let score = 0;

  // Scam language weight
  score += analysis.scamIndicators.length * 5;

  // Deepfake risk weight
  score += analysis.deepfakeRisk.score * 0.5;

  // Suspicious factors weight
  score += analysis.suspiciousFactors.length * 3;

  // Voice patterns
  if (analysis.voicePatterns.filler_words === 0) {
    score += 10; // Unnaturally perfect speech
  }

  if (analysis.voicePatterns.repetitions > 5) {
    score += 8; // Excessive repetition
  }

  return Math.min(100, Math.max(0, score));
}

function getThreatLevel(riskScore) {
  if (riskScore >= 70) return 'danger';
  if (riskScore >= 40) return 'warning';
  return 'none';
}

function getRecommendation(analysis) {
  const riskScore = analysis.overallRiskScore;

  if (riskScore >= 70) {
    return '🚨 HIGH RISK: This call exhibits multiple scam indicators. Do NOT provide personal information or money. Report to authorities.';
  } else if (riskScore >= 40) {
    return '⚠️ SUSPICIOUS: Be cautious. Verify the caller\'s identity independently before providing any information.';
  } else if (analysis.deepfakeRisk.score > 40) {
    return '🎙️ DEEPFAKE DETECTED: This may be a synthetic voice. Hang up and verify directly with the company.';
  } else {
    return '✅ LOW RISK: The call appears legitimate, but always stay cautious with unsolicited calls.';
  }
}

export default {
  analyzeVoiceCall,
  analyzeScamLanguage,
  analyzeDeepfakeIndicators,
  analyzeVoicePatterns,
};
