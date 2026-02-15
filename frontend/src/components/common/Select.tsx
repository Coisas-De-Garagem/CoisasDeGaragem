import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  options,
  ...props
}: SelectProps) {
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
      <select
        id={props.id}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
