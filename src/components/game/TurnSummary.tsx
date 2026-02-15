import type { TurnResult } from '@/types/engine.ts';
import { Card } from '@/components/ui/Card.tsx';
import { StatChange } from '@/components/ui/StatChange.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Newspaper, TrendingUp, DollarSign, Users } from 'lucide-react';

interface TurnSummaryProps {
  result: TurnResult;
  onContinue: () => void;
}

export function TurnSummary({ result, onContinue }: TurnSummaryProps) {
  const avgPollChange = result.poll_changes.length > 0
    ? result.poll_changes.reduce((s, c) => s + c.player_change, 0) / result.poll_changes.length
    : 0;

  return (
    <Card accent="gold" className="space-y-4">
      <div className="flex items-center gap-2">
        <Newspaper size={20} className="text-gold-campaign" />
        <h3 className="text-lg font-bold text-text-primary">Week {result.turn} Summary</h3>
      </div>

      {/* Notifications */}
      {result.notifications.length > 0 && (
        <div className="space-y-1">
          {result.notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-2">
              <Badge variant={n.type === 'success' ? 'success' : n.type === 'warning' ? 'warning' : n.type === 'danger' ? 'danger' : 'info'}>
                {n.type}
              </Badge>
              <p className="text-sm text-text-secondary">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <TrendingUp size={16} className="mx-auto text-text-muted mb-1" />
          <p className="text-xs text-text-muted">Polls</p>
          <StatChange value={avgPollChange} suffix="%" />
        </div>
        <div className="text-center">
          <DollarSign size={16} className="mx-auto text-text-muted mb-1" />
          <p className="text-xs text-text-muted">Net Cash</p>
          <StatChange value={result.financial_summary.net} prefix="$" />
        </div>
        <div className="text-center">
          <Users size={16} className="mx-auto text-text-muted mb-1" />
          <p className="text-xs text-text-muted">Momentum</p>
          <StatChange value={result.momentum_change} />
        </div>
      </div>

      {/* Continue */}
      <button
        onClick={onContinue}
        className="w-full py-3 bg-red-campaign text-white rounded-lg font-semibold text-sm min-h-[48px]"
      >
        Continue →
      </button>
    </Card>
  );
}
