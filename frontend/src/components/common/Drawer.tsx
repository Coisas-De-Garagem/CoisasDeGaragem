import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { lockScroll, unlockScroll } from './Modal';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Lado de onde o drawer entra. */
  side?: 'left' | 'right';
  width?: string;
}

/**
 * Painel lateral deslizante (overlay). Útil para menus e filtros.
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = 'w-80',
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sideClasses =
    side === 'left'
      ? 'left-0 animate-slide-in-left'
      : 'right-0 animate-slide-in-right';

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <aside
        className={`relative ${width} h-full bg-surface shadow-xl flex flex-col ${sideClasses}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={
          side === 'right'
            ? { marginLeft: 'auto' }
            : undefined
        }
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-main">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors"
              aria-label="Fechar"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
