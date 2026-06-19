import { colors } from './colors';

// Button styles
export const buttonStyles = {
  base: 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    primary: `bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:hover:bg-blue-500`,
    secondary: `bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 disabled:hover:bg-slate-100`,
    danger: `bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:hover:bg-red-500`,
    outline: `border border-slate-300 text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:hover:bg-white`,
  },
};

// Card styles
export const cardStyles = {
  base: 'rounded-lg border border-e2e8f0 bg-white shadow-sm',
  hover: 'hover:shadow-md transition-shadow',
  padding: 'p-4 sm:p-6',
};

// Input styles
export const inputStyles = {
  base: 'w-full px-4 py-2 rounded-lg border border-e2e8f0 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  disabled: 'bg-slate-50 cursor-not-allowed opacity-60',
};

// Label styles
export const labelStyles = {
  base: 'block text-sm font-medium text-slate-900 mb-2',
};

// Risk badge styles
export const getRiskBadgeStyles = (score) => {
  if (score >= 85) {
    return {
      bg: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-600',
      icon: '🚨',
      label: 'Critical',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-orange-500/10 border-orange-500/20',
      text: 'text-orange-600',
      icon: '⚠️',
      label: 'High',
    };
  }
  if (score >= 50) {
    return {
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      text: 'text-yellow-600',
      icon: '⚡',
      label: 'Medium',
    };
  }
  return {
    bg: 'bg-green-500/10 border-green-500/20',
    text: 'text-green-600',
    icon: '✅',
    label: 'Low',
  };
};

// Layout styles
export const layoutStyles = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  pageSection: 'py-8 space-y-6',
  sectionHeader: 'space-y-2 mb-6',
  sectionTitle: 'text-2xl sm:text-3xl font-bold text-slate-900',
  sectionSubtitle: 'text-slate-600',
};

// List styles
export const listStyles = {
  container: 'space-y-2',
  item: 'flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition',
};

// Grid styles
export const gridStyles = {
  cols1: 'grid-cols-1',
  cols2: 'grid-cols-1 sm:grid-cols-2',
  cols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cols4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  gap: 'gap-4 sm:gap-6',
};
