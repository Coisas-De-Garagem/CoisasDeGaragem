interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'card' | 'list';
  count?: number;
  width?: string;
  height?: string;
  /**
   * Raio de borda. Útil para espelhar o `rounded-xl` dos StatCards e evitar
   * reflow visual quando o conteúdo real aparece.
   */
  rounded?: 'rounded-none' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
}

const VARIANT_CLASSES: Record<string, string> = {
  text: 'h-4 w-24',
  circular: 'w-12 h-12 rounded-full',
  card: 'h-24 w-full',
  list: 'h-4 w-full',
};

export function Skeleton({
  className,
  variant = 'text',
  count = 1,
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-md',
}: SkeletonProps) {
  // `rounded-full` (variant circular) deve prevalecer sobre o prop `rounded`.
  const variantClass = VARIANT_CLASSES[variant];
  const hasVariantRadius = variantClass.includes('rounded-');
  const radiusClass = hasVariantRadius ? '' : rounded;
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-800';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClass} ${radiusClass} ${width} ${height} ${className || ''}`}
          aria-hidden="true"
          role="presentation"
        />
      ))}
    </>
  );
}
