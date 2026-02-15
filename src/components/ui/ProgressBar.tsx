interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'red' | 'blue' | 'green' | 'gold' | 'gray';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const colorClasses = {
  red: 'bg-red-campaign',
  blue: 'bg-blue-campaign',
  green: 'bg-success',
  gold: 'bg-gold-campaign',
  gray: 'bg-text-muted',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({ value, max = 100, color = 'red', height = 'md', showLabel = false, label, className = '' }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>{label}</span>
          {showLabel && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-bg-elevated rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
