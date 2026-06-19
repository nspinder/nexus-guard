// Email validation - RFC 5322 compliant
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation - supports international formats
export const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Check if it's between 10-15 digits (international standard)
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return false;
  }

  return true;
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Password validation - at least 8 chars, 1 uppercase, 1 number
export const validatePassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

// Duration validation - must be positive number
export const validateDuration = (duration) => {
  const num = parseInt(duration, 10);
  return !isNaN(num) && num > 0 && num <= 1440; // Max 24 hours
};

// Risk threshold validation - must be 0-100
export const validateRiskThreshold = (threshold) => {
  const num = parseInt(threshold, 10);
  return !isNaN(num) && num >= 0 && num <= 100;
};

// Validate thresholds are in correct order
export const validateThresholdOrder = (low, medium, high) => {
  const l = parseInt(low, 10);
  const m = parseInt(medium, 10);
  const h = parseInt(high, 10);

  return l < m && m < h;
};

// Sanitize text input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000); // Limit to 1000 chars
};

// Get validation error message
export const getValidationError = (field, value) => {
  switch (field) {
    case 'email':
      return !validateEmail(value) ? 'Please enter a valid email address' : null;
    case 'phone':
      return !validatePhoneNumber(value) ? 'Phone number must be 10-15 digits' : null;
    case 'url':
      return !validateURL(value) ? 'Please enter a valid URL' : null;
    case 'password':
      return !validatePassword(value)
        ? 'Password must be at least 8 characters with uppercase and number'
        : null;
    case 'duration':
      return !validateDuration(value) ? 'Duration must be between 1 and 1440 minutes' : null;
    case 'threshold':
      return !validateRiskThreshold(value) ? 'Threshold must be between 0 and 100' : null;
    default:
      return null;
  }
};
