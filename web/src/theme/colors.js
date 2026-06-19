export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },

  // Risk levels
  risk: {
    low: {
      bg: '#dcfce7',
      border: '#bbf7d0',
      text: '#166534',
      icon: '#10b981',
    },
    medium: {
      bg: '#fef08a',
      border: '#fde047',
      text: '#92400e',
      icon: '#f97316',
    },
    high: {
      bg: '#fee2e2',
      border: '#fecaca',
      text: '#991b1b',
      icon: '#ef4444',
    },
    critical: {
      bg: '#fda5a5',
      border: '#fa8072',
      text: '#7c2d12',
      icon: '#dc2626',
    },
  },

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral/Gray scale
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#0f172a',
  },

  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    light: '#e2e8f0',
    white: '#ffffff',
  },

  // Border colors
  border: {
    light: '#e2e8f0',
    default: '#cbd5e1',
    dark: '#94a3b8',
  },
};

export const getRiskColor = (score) => {
  if (score >= 85) return colors.risk.critical;
  if (score >= 70) return colors.risk.high;
  if (score >= 50) return colors.risk.medium;
  return colors.risk.low;
};

export const getRiskLevel = (score) => {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};
