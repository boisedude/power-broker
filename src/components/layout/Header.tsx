import { useGameStore } from '@/store/useGameStore.ts';
import { formatMoney, formatTurnLabel } from '@/utils/formatters.ts';
import { getTurnDate } from '@/engine/BalanceConstants.ts';
import { ActionPointDisplay } from '@/components/ui/ActionPointDisplay.tsx';

export function Header() {
  const currentTurn = useGameStore((s) => s.current_turn);
  const maxTurns = useGameStore((s) => s.max_turns);
  const playerSupport = useGameStore((s) => s.polls.player_support);
  const opponentSupport = useGameStore((s) => s.polls.opponent_support);
  const cash = useGameStore((s) => s.finances.cash_on_hand);
  const ap = useGameStore((s) => s.actions_remaining);

  const margin = playerSupport - opponentSupport;
  const marginText = margin > 0 ? `+${margin.toFixed(1)}` : margin.toFixed(1);
  const marginColor = margin > 0 ? 'text-success' : margin < 0 ? 'text-danger' : 'text-text-muted';

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/95 backdrop-blur-sm border-b border-navy-700 px-4 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted uppercase tracking-wider">{getTurnDate(currentTurn)}</span>
          <span className="text-sm font-bold text-text-primary">{formatTurnLabel(currentTurn, maxTurns)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className={`text-lg font-black ${marginColor}`}>
            {playerSupport.toFixed(1)}–{opponentSupport.toFixed(1)}
          </span>
          <span className={`text-xs font-medium ${marginColor}`}>{marginText}%</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-bold text-success">{formatMoney(cash)}</span>
          <ActionPointDisplay current={ap} max={5} compact />
        </div>
      </div>
    </header>
  );
}
