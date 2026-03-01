import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
  type = 'text',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const widthClass = fullWidth ? 'w-full' : '';
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
      <div className="relative">
        <input
          id={props.id}
          type={currentType}
          className={`
            w-full px-4 py-2.5 
            bg-white border border-neutral-200 
            rounded-xl text-neutral-900 
            placeholder-neutral-400 
            focus:ring-4 focus:ring-primary/10 focus:border-primary 
            focus:outline-none 
            disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed 
            transition-all duration-300
            ${isPassword ? 'pr-12' : ''}
            ${error ? 'border-error ring-error/10' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-primary transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Esconder senha' : 'Exibir senha'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
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