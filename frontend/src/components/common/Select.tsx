import type { SelectHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helperText,
  fullWidth = true,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className={`w-full ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-text-main mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={selectId}
          className={`
            appearance-none w-full h-11
            bg-surface text-text-main
            border border-border-strong rounded-lg
            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            pl-3.5 pr-10
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-text-subtle group-focus-within:text-primary transition-colors">
          <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4" />
        </span>
      </div>

      {error && (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-error font-medium" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
