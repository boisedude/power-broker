import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    <div className="relative">
      <PageContainer title="Allocate Actions" className={isActionPhase ? '!pb-28' : ''}>
        <div className="flex items-center justify-between mb-4">
          <ActionPointDisplay current={ap} max={5} />
          <span className="text-xs text-text-muted">{ap} AP remaining</span>
        </div>

        <div className="space-y-2">
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

        {turnPhase === 'briefing' && (
          <Button fullWidth size="lg" variant="secondary" className="mt-6" onClick={() => setTurnPhase('actions')}>
            Begin Turn
          </Button>
        )}
      </PageContainer>

      {/* Sticky End Turn button — always visible above bottom nav */}
      {isActionPhase && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pt-2 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
          <div className="max-w-lg mx-auto">
            <Button fullWidth size="lg" variant={ap === 0 ? 'primary' : 'secondary'} onClick={() => { endTurn(); navigate('/game'); }}>
              {ap === 0 ? 'End Turn →' : `End Turn (${ap} AP unused) →`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
