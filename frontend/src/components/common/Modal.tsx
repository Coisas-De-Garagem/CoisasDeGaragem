import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Rodapé do modal (geralmente ações). */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Esconde o botão de fechar no canto. */
  hideCloseButton?: boolean;
}

const SIZE_CLASSES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-xl',
  xl: 'sm:max-w-3xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideCloseButton = false,
}: ModalProps) {
  // Fecha com Escape.
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trava o scroll do body quando aberto.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
    >
      <div
        className={`relative w-full ${SIZE_CLASSES[size]} bg-surface text-text-main rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] flex flex-col animate-slide-up sm:animate-scale-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Cabecalho */}
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-text-main">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-text-muted mt-0.5">{description}</p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 -mr-1 p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-hover transition-colors"
                aria-label="Fechar"
              >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Conteudo */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Rodape */}
        {footer && (
          <div className="px-5 py-4 border-t border-border bg-surface-sunken/50 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
