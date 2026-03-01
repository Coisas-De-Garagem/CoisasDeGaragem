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
          className="block text-sm font-medium text-neutral-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={props.id}
        className={`
          w-full px-4 py-2.5 
          bg-white border border-neutral-200 
          rounded-xl text-neutral-900 
          placeholder-neutral-400 
          focus:ring-4 focus:ring-primary/10 focus:border-primary 
          focus:outline-none 
          disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed 
          transition-all duration-300
          ${error ? 'border-error ring-error/10' : ''}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
        {...props}
      />
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