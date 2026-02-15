import type { ElectionResult } from '@/types/engine.ts';
import { Card } from '@/components/ui/Card.tsx';
import { ProgressBar } from '@/components/ui/ProgressBar.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatPercent } from '@/utils/formatters.ts';

interface ElectionResultsProps {
  result: ElectionResult;
}

export function ElectionResults({ result }: ElectionResultsProps) {
  const playerWon = result.winner === 'player';

  return (
    <Card accent={playerWon ? 'green' : 'red'}>
      <h3 className="text-sm font-bold text-text-primary mb-3">Final Results</h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-campaign font-medium">Gonzalez (R)</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatPercent(result.player_pct)}</span>
              {playerWon && <Badge variant="success">Won</Badge>}
            </div>
          </div>
          <ProgressBar value={result.player_pct} color="red" height="md" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-campaign font-medium">Lee (D)</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatPercent(result.opponent_pct)}</span>
              {!playerWon && <Badge variant="info">Won</Badge>}
            </div>
          </div>
          <ProgressBar value={result.opponent_pct} color="blue" height="md" />
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-navy-700 flex justify-between text-xs text-text-muted">
        <span>Turnout: {formatPercent(result.turnout)}</span>
        <span>Margin: {result.margin > 0 ? '+' : ''}{formatPercent(result.margin)}</span>
        {result.recount && <Badge variant="warning">Recount</Badge>}
      </div>
    </Card>
  );
}
