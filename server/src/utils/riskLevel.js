export function getRiskLevel(probability, userThresholds) {
  const { lowRiskThreshold, mediumRiskThreshold, highRiskThreshold } = userThresholds;

  if (probability < lowRiskThreshold) {
    return { level: 'low', color: 'green', shouldAlert: false };
  } else if (probability < mediumRiskThreshold) {
    return { level: 'medium', color: 'orange', shouldAlert: false };
  } else if (probability < highRiskThreshold) {
    return { level: 'high', color: 'red', shouldAlert: true };
  } else {
    return { level: 'critical', color: 'darkred', shouldAlert: true };
  }
}

export function formatRiskResponse(probability, userThresholds) {
  const risk = getRiskLevel(probability, userThresholds);
  return {
    probability,
    risk: risk.level,
    color: risk.color,
    shouldAlert: risk.shouldAlert,
  };
}
