import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatChangeProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

export function StatChange({ value, prefix = '', suffix = '' }: StatChangeProps) {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-text-muted text-sm">
        <Minus size={12} /> {prefix}0{suffix}
      </span>
    );
  }

  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? '+' : ''}{prefix}{value.toFixed(1)}{suffix}
    </span>
  );
}
