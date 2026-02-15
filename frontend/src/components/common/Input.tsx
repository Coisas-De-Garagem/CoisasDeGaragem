import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`mb-4 ${widthClass}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={props.id}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${props.id}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}