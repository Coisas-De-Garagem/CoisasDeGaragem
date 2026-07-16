import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  /** Ícone exibido à esquerda dentro do campo. */
  leftIcon?: ReactNode;
  /** Texto/sufixo exibido à direita (ex.: unidade "R$"). */
  rightAddon?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  leftIcon,
  rightAddon,
  className = '',
  type = 'text',
  id,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const widthClass = fullWidth ? 'w-full' : '';
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputId = id || props.name;

  return (
    <div className={`w-full ${widthClass}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-main mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-subtle pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={currentType}
          className={`
            w-full h-11
            bg-surface text-text-main placeholder:text-text-subtle
            border border-border-strong rounded-lg
            focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${isPassword || rightAddon ? 'pr-10' : 'pr-3.5'}
            ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-subtle hover:text-text-main transition-colors"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Esconder senha' : 'Exibir senha'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
        {!isPassword && rightAddon && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted text-sm pointer-events-none">
            {rightAddon}
          </span>
        )}
      </div>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-error font-medium"
          role="alert"
        >
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
