import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { ProgressBar } from '@/components/ui/ProgressBar.tsx';
import { StatChange } from '@/components/ui/StatChange.tsx';
import { ActionPointDisplay } from '@/components/ui/ActionPointDisplay.tsx';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { getTurnDate } from '@/engine/BalanceConstants.ts';
import { getMomentumLabel } from '@/engine/MomentumEngine.ts';
import { formatPercent } from '@/utils/formatters.ts';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const turn = useGameStore((s) => s.current_turn);
  const maxTurns = useGameStore((s) => s.max_turns);
  const phase = useGameStore((s) => s.phase);
  const playerSupport = useGameStore((s) => s.polls.player_support);
  const opponentSupport = useGameStore((s) => s.polls.opponent_support);
  const undecided = useGameStore((s) => s.polls.undecided);
  const cash = useGameStore((s) => s.finances.cash_on_hand);
  const momentum = useGameStore((s) => s.momentum);
  const ap = useGameStore((s) => s.actions_remaining);
  const turnPhase = useGameStore((s) => s.turn_phase);
  const lastResult = useGameStore((s) => s.last_turn_result);
  const endTurn = useGameStore((s) => s.endTurn);
  const setTurnPhase = useGameStore((s) => s.setTurnPhase);
  const opponent = useGameStore((s) => s.opponent);
  const gameOver = useGameStore((s) => s.game_over);
  const activeEvents = useGameStore((s) => s.active_events);

  // Navigate to events screen when events phase starts
  useEffect(() => {
    if (turnPhase === 'events' && activeEvents.length > 0) {
      navigate('/game/events');
    }
  }, [turnPhase, activeEvents.length, navigate]);

  // Navigate to election night when game ends
  useEffect(() => {
    if (gameOver) {
      navigate('/election');
    }
  }, [gameOver, navigate]);

  const handleEndTurn = () => {
    endTurn();
  };

  return (
    <PageContainer>
      {/* Campaign Phase Banner */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Week {turn} of {maxTurns}</h2>
          <p className="text-xs text-text-secondary">{getTurnDate(turn)} • <span className="capitalize">{phase}</span> Phase</p>
        </div>
        <Badge variant={momentum >= 0 ? 'success' : 'warning'}>
          {getMomentumLabel(momentum)}
        </Badge>
      </div>

      {/* Morning Briefing */}
      {turnPhase === 'briefing' && lastResult && (
        <Card accent="gold" className="mb-4">
          <h3 className="text-sm font-bold text-gold-campaign mb-2">Morning Briefing</h3>
          {lastResult.notifications.map((n, i) => (
            <p key={i} className="text-sm text-text-secondary mb-1">• {n.title}: {n.message}</p>
          ))}
          {lastResult.opponent_actions && lastResult.opponent_actions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-navy-700/50">
              <p className="text-xs text-blue-campaign font-medium mb-1">Opponent Activity:</p>
              {lastResult.opponent_actions.map((a, i) => (
                <p key={i} className="text-xs text-text-muted mb-0.5">• {a}</p>
              ))}
            </div>
          )}
          {lastResult.poll_changes.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-text-muted">Poll movement:</p>
              <StatChange value={lastResult.poll_changes.reduce((s, c) => s + c.player_change, 0) / Math.max(lastResult.poll_changes.length, 1)} suffix="%" />
            </div>
          )}
          <Button size="md" variant="primary" fullWidth className="mt-3" onClick={() => setTurnPhase('actions')}>
            Begin Turn →
          </Button>
        </Card>
      )}

      {/* Poll Overview */}
      <Card className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-text-primary">Polls</h3>
          <button onClick={() => navigate('/game/polls')} className="text-xs text-info px-2 py-1 -mr-2 min-h-[44px] flex items-center">Details →</button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-red-campaign font-medium">Gonzalez</span>
            <span className="text-text-primary font-bold">{formatPercent(playerSupport)}</span>
          </div>
          <ProgressBar value={playerSupport} color="red" height="md" />
          <div className="flex justify-between text-sm">
            <span className="text-blue-campaign font-medium">Lee</span>
            <span className="text-text-primary font-bold">{formatPercent(opponentSupport)}</span>
          </div>
          <ProgressBar value={opponentSupport} color="blue" height="md" />
          <p className="text-xs text-text-muted text-center">{formatPercent(undecided)} undecided</p>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Card>
          <p className="text-xs text-text-muted mb-1">War Chest</p>
          <MoneyDisplay amount={cash} />
        </Card>
        <Card>
          <p className="text-xs text-text-muted mb-1">Action Points</p>
          <ActionPointDisplay current={ap} max={5} compact />
        </Card>
      </div>

      {/* Opponent Brief */}
      <Card accent="blue" className="mb-3">
        <h3 className="text-sm font-bold text-blue-campaign mb-1">Opponent: {opponent.name}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          <span>Strategy: <span className="text-text-primary capitalize">{opponent.strategy}</span></span>
          <span>Endorsements: <span className="text-text-primary">{opponent.endorsements_secured.length}</span></span>
          <span>Attack Mode: <span className={opponent.attack_mode ? 'text-danger' : 'text-success'}>{opponent.attack_mode ? 'Yes' : 'No'}</span></span>
          <span>Staff Level: <span className="text-text-primary">{opponent.staff_level}/5</span></span>
        </div>
      </Card>

      {/* End Turn Button */}
      {turnPhase === 'actions' && (
        <Button fullWidth size="lg" onClick={handleEndTurn}>
          End Turn →
        </Button>
      )}
      {turnPhase === 'briefing' && !lastResult && (
        <Button fullWidth size="lg" variant="secondary" onClick={() => setTurnPhase('actions')}>
          Start Campaign
        </Button>
      )}
    </PageContainer>
  );
}
