import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { ActionCard } from '@/components/game/ActionCard.tsx';
import { ActionPointDisplay } from '@/components/ui/ActionPointDisplay.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { isGOTVAvailable } from '@/engine/GOTVEngine.ts';
import type { ActionType } from '@/types/game.ts';

const ACTION_DEFINITIONS: { type: ActionType; name: string; description: string }[] = [
  { type: 'fundraise', name: 'Fundraise', description: 'Hold events and call donors to raise campaign funds' },
  { type: 'campaign', name: 'Campaign', description: 'Hold rallies, knock doors, and meet voters' },
  { type: 'seek-endorsement', name: 'Seek Endorsement', description: 'Court key endorsements from organizations and leaders' },
  { type: 'oppo-research', name: 'Oppo Research', description: 'Investigate opponent vulnerabilities' },
  { type: 'debate-prep', name: 'Debate Prep', description: 'Prepare for upcoming debate performances' },
  { type: 'gotv', name: 'Get Out the Vote', description: 'Invest in ground game for Election Day turnout' },
];

export function Actions() {
  const ap = useGameStore((s) => s.actions_remaining);
  const actionsTaken = useGameStore((s) => s.actions_taken);
  const allocateAction = useGameStore((s) => s.allocateAction);
  const turnPhase = useGameStore((s) => s.turn_phase);
  const currentTurn = useGameStore((s) => s.current_turn);
  const endTurn = useGameStore((s) => s.endTurn);
  const setTurnPhase = useGameStore((s) => s.setTurnPhase);

  const handleAllocate = (type: ActionType) => {
    allocateAction({ type, intensity: 1 });
  };

  const isActionPhase = turnPhase === 'actions';

  return (
    <PageContainer title="Allocate Actions">
      <div className="flex items-center justify-between mb-4">
        <ActionPointDisplay current={ap} max={5} />
        <span className="text-xs text-text-muted">{ap} AP remaining</span>
      </div>

      <div className="space-y-2 mb-6">
        {ACTION_DEFINITIONS.map((action) => {
          const isGotv = action.type === 'gotv';
          const gotvLocked = isGotv && !isGOTVAvailable(currentTurn);
          const count = actionsTaken.filter((a) => a === action.type).length;

          return (
            <ActionCard
              key={action.type}
              type={action.type}
              name={action.name}
              description={gotvLocked ? `Unlocks Week 21 — invest in ground game for Election Day` : action.description}
              cost={1}
              disabled={!isActionPhase || ap < 1 || gotvLocked}
              count={count}
              onAllocate={() => handleAllocate(action.type)}
            />
          );
        })}
      </div>

      {isActionPhase && (
        <Button fullWidth size="lg" variant={ap === 0 ? 'primary' : 'secondary'} onClick={endTurn}>
          {ap === 0 ? 'End Turn →' : `End Turn (${ap} AP unused) →`}
        </Button>
      )}
      {turnPhase === 'briefing' && (
        <Button fullWidth size="lg" variant="secondary" onClick={() => setTurnPhase('actions')}>
          Begin Turn
        </Button>
      )}
    </PageContainer>
  );
}
