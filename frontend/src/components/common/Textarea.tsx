import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className={`w-full ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-main mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full min-h-[96px] px-3.5 py-2.5
          bg-surface text-text-main placeholder:text-text-subtle
          border border-border-strong rounded-lg
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 resize-y
          ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
        }
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error font-medium" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
