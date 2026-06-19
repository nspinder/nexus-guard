import { AlertCircle, CheckCircle } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function ValidatedInput({
  label,
  value,
  onChange,
  validator,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  showValidation = true,
  className = '',
  helperText,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState(null);

  const validate = useCallback(
    (val) => {
      if (!validator) {
        setError(null);
        return true;
      }

      const result = validator(val);
      if (result === true) {
        setError(null);
        return true;
      } else {
        setError(result);
        return false;
      }
    },
    [validator]
  );

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (touched) {
      validate(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  const isValid = touched && !error;
  const hasError = touched && error;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg border transition focus:outline-none focus:ring-1
            ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50'
                : isValid
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}
          `}
          {...props}
        />

        {showValidation && touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {touched && error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}
