interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl bg-white/15',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}
