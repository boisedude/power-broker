import { Zap } from 'lucide-react';

interface ActionPointDisplayProps {
  current: number;
  max: number;
  compact?: boolean;
}

export function ActionPointDisplay({ current, max, compact = false }: ActionPointDisplayProps) {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-gold-campaign font-bold">
        <Zap size={14} fill="currentColor" />
        {current}/{max}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            i < current ? 'bg-gold-campaign text-bg-primary' : 'bg-bg-elevated text-text-muted'
          }`}
        >
          <Zap size={12} fill={i < current ? 'currentColor' : 'none'} />
        </div>
      ))}
    </div>
  );
}
