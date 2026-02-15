import { DollarSign } from 'lucide-react';
import { formatMoney } from '@/utils/formatters.ts';

interface MoneyDisplayProps {
  amount: number;
  compact?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function MoneyDisplay({ amount, compact = false, showIcon = true, className = '' }: MoneyDisplayProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-success ${className}`}>
      {showIcon && <DollarSign size={compact ? 12 : 16} />}
      {formatMoney(amount)}
    </span>
  );
}
