import type { ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Abas responsivas: barra horizontal rolável no mobile.
 */
export function Tabs({ items, value, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`flex gap-1 border-b border-border overflow-x-auto no-scrollbar ${className}`}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={`
              flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-medium
              whitespace-nowrap transition-colors
              ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-main hover:border-border-strong'
              }
            `}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
