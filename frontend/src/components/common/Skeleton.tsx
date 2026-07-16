interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'card' | 'list';
  count?: number;
  width?: string;
  height?: string;
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
}: SkeletonProps) {
  const baseClasses =
    'animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${VARIANT_CLASSES[variant]} ${width} ${height} ${className || ''}`}
          aria-hidden="true"
          role="presentation"
        />
      ))}
    </>
  );
}
