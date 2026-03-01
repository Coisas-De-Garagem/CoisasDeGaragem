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
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={props.id}
          className={`
            appearance-none w-full px-4 py-2.5 
            bg-white border border-neutral-200 
            rounded-xl text-neutral-900 
            focus:ring-4 focus:ring-primary/10 focus:border-primary 
            focus:outline-none 
            disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed 
            transition-all duration-300
            pr-10
            ${error ? 'border-error ring-error/10' : ''}
            ${className}
          `}
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

        {/* Custom Arrow Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-400 group-focus-within:text-primary transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1.5 text-sm text-error font-medium flex items-center gap-1"
          role="alert"
        >
          <span className="w-1 h-1 rounded-full bg-error" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={`${props.id}-helper`}
          className="mt-1.5 text-sm text-neutral-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
