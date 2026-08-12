import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
}

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder,
  label,
  fullWidth = true,
  className = '',
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder || '';

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-text-main mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full h-12 px-4
          bg-surface text-text-main
          border border-border-strong rounded-lg
          focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
          transition-colors duration-200 text-left
        `}
      >
        <span className="block truncate text-base font-medium">
          {displayValue}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`w-4 h-4 text-text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-auto focus:outline-none">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`
                    relative cursor-default select-none py-3 pl-10 pr-4 text-sm font-medium
                    hover:bg-background transition-colors
                    ${isSelected ? 'text-primary bg-primary/5' : 'text-text-main'}
                  `}
                >
                  <span className="block truncate">
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-primary">
                      <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
