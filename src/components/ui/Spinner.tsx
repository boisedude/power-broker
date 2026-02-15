interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div className={`${sizeClasses[size]} border-2 border-bg-elevated border-t-red-campaign rounded-full animate-spin`} />
  );
}
