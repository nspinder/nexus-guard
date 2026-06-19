// Email validator
export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return 'Please enter a valid email address';
  return true;
};

// Password validator
export const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return true;
};

// Phone number validator
export const validatePhoneNumber = (value) => {
  if (!value) return 'Phone number is required';
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(value.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return true;
};

// URL validator
export const validateURL = (value) => {
  if (!value) return 'URL is required';
  try {
    new URL(value);
    return true;
  } catch {
    return 'Please enter a valid URL (e.g., https://example.com)';
  }
};

// Generic required field validator
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return true;
};

// Min length validator
export const validateMinLength = (min, fieldName = 'This field') => (value) => {
  if (!value) return true; // Only validate if field has value
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  return true;
};

// Max length validator
export const validateMaxLength = (max, fieldName = 'This field') => (value) => {
  if (!value) return true;
  if (value.length > max) {
    return `${fieldName} must not exceed ${max} characters`;
  }
  return true;
};

// Number range validator
export const validateRange = (min, max, fieldName = 'This field') => (value) => {
  if (!value) return true;
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }
  return true;
};

// Match fields validator (for password confirmation)
export const validateMatch = (otherValue, fieldName = 'Fields') => (value) => {
  if (value !== otherValue) {
    return `${fieldName} do not match`;
  }
  return true;
};

// Compose multiple validators
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) {
      return result;
    }
  }
  return true;
};
