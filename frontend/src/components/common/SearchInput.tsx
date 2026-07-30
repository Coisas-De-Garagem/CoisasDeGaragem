import type { InputHTMLAttributes } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

/**
 * Campo de busca com ícone de lupa e botão de limpar.
 */
export function SearchInput({
  value,
  onClear,
  className = '',
  placeholder = 'Buscar',
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-subtle pointer-events-none">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
      </span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        className={`
          w-full h-11 pl-10 pr-10
          bg-surface text-text-main placeholder:text-text-subtle
          border border-border-strong rounded-lg
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
          transition-colors duration-200
          [appearance:none] [&::-webkit-search-cancel-button]:hidden
        `}
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-subtle hover:text-text-main transition-colors"
          aria-label="Limpar busca"
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
