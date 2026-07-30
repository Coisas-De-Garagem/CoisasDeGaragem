import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const SIDE_CLASSES = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * Tooltip via hover/focus. Conteúdo aparece em um balão preto.
 */
export function Tooltip({ content, children, side = 'top', className = '' }: TooltipProps) {
  return (
    <span className={`relative inline-flex group/tip ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`
          pointer-events-none absolute z-50 w-max max-w-xs
          rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white
          opacity-0 scale-95 transition-opacity duration-150
          group-hover/tip:opacity-100 group-hover/tip:scale-100
          group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100
          dark:bg-neutral-100 dark:text-neutral-900
          ${SIDE_CLASSES[side]}
        `}
      >
        {content}
      </span>
    </span>
  );
}
