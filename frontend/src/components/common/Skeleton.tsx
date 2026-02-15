interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'card' | 'list';
  count?: number;
  width?: string;
  height?: string;
}

export function Skeleton({
  className,
  variant = 'text',
  count = 1,
  width = 'w-full',
  height = 'h-4',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  const variantClasses: Record<string, string> = {
    text: 'h-4 w-24',
    circular: 'w-12 h-12 rounded-full',
    card: 'h-24 w-full',
    list: 'h-4 w-full',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${width} ${height} ${className || ''}`}
          aria-hidden="true"
          role="presentation"
        />
      ))}
    </>
  );
}
