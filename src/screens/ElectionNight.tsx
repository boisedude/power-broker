import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { ProgressBar } from '@/components/ui/ProgressBar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { calculateElectionResult } from '@/engine/ElectionEngine.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { formatPercent } from '@/utils/formatters.ts';
import { useNavigate } from 'react-router-dom';
import { Flag, Trophy, XCircle } from 'lucide-react';
import type { ElectionResult } from '@/types/engine.ts';

export function ElectionNight() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'counting' | 'called' | 'recount'>('counting');
  const [displayedPlayer, setDisplayedPlayer] = useState(0);
  const [displayedOpponent, setDisplayedOpponent] = useState(0);
  const [result, setResult] = useState<ElectionResult | null>(null);
  
  const polls = useGameStore((s) => s.polls);
  const opponent = useGameStore((s) => s.opponent);
  const seed = useGameStore((s) => s.seed);
  const gotv = useGameStore((s) => s.gotv_investment);

  const finances = useGameStore((s) => s.finances);
  const staff = useGameStore((s) => s.staff);
  const endorsements = useGameStore((s) => s.endorsements);
  const difficulty = useGameStore((s) => s.difficulty);

  useEffect(() => {
    // Calculate result on mount
    const rng = new SeededRandom(seed + 99999);
    const gameState = {
      game_id: '',
      difficulty,
      current_turn: 26,
      max_turns: 26,
      phase: 'election' as const,
      action_points: 0,
      max_action_points: 5,
      polls,
      finances,
      ads: [],
      staff,
      endorsements,
      opponent,
      momentum: 0,
      gotv_investment: gotv,
      actions_taken_this_turn: [],
      game_over: true,
      won: null,
      final_margin: null,
      seed,
    };
    const electionResult = calculateElectionResult(gameState, rng);
    setResult(electionResult);

    // Animate vote counting
    const totalSteps = 30;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayedPlayer(Math.round(electionResult.player_votes * eased));
      setDisplayedOpponent(Math.round(electionResult.opponent_votes * eased));
      
      if (step >= totalSteps) {
        clearInterval(interval);
        if (electionResult.recount) {
          setPhase('recount');
          setTimeout(() => setPhase('called'), 3000);
        } else {
          setPhase('called');
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const playerWon = result?.winner === 'player';

  return (
    <div className="min-h-screen bg-bg-primary">
      <PageContainer>
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <Flag size={32} className="mx-auto text-red-campaign mb-2" />
          <h1 className="text-2xl font-black text-text-primary">ELECTION NIGHT</h1>
          <p className="text-sm text-text-secondary">NV-03 Congressional Race</p>
        </div>

        {/* Vote Tally */}
        <Card className="mb-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <img src="/images/steve-profile.jpg" alt="Steve Gonzalez" className="w-8 h-8 rounded-full object-cover border-2 border-red-campaign" />
                  <span className="text-sm font-bold text-red-campaign">Steve Gonzalez (R)</span>
                  {phase === 'called' && playerWon && <Badge variant="success">WINNER</Badge>}
                </div>
                <span className="text-lg font-black text-text-primary">{displayedPlayer.toLocaleString()}</span>
              </div>
              <ProgressBar value={result?.player_pct ?? 0} color="red" height="lg" />
              {result && phase === 'called' && (
                <p className="text-xs text-text-secondary mt-1">{formatPercent(result.player_pct)}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <img src="/images/susie-profile.jpg" alt="Susie Lee" className="w-8 h-8 rounded-full object-cover border-2 border-blue-campaign" />
                  <span className="text-sm font-bold text-blue-campaign">Susie Lee (D)</span>
                  {phase === 'called' && !playerWon && <Badge variant="info">WINNER</Badge>}
                </div>
                <span className="text-lg font-black text-text-primary">{displayedOpponent.toLocaleString()}</span>
              </div>
              <ProgressBar value={result?.opponent_pct ?? 0} color="blue" height="lg" />
              {result && phase === 'called' && (
                <p className="text-xs text-text-secondary mt-1">{formatPercent(result.opponent_pct)}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Status Messages */}
        {phase === 'counting' && (
          <Card className="mb-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-gold-campaign rounded-full animate-pulse" />
              <p className="text-sm text-gold-campaign font-medium">Counting votes...</p>
            </div>
          </Card>
        )}

        {phase === 'recount' && (
          <Card accent="gold" className="mb-4 text-center">
            <p className="text-sm text-gold-campaign font-bold">RACE TOO CLOSE TO CALL</p>
            <p className="text-xs text-text-secondary mt-1">Automatic recount triggered — margin under 2%</p>
          </Card>
        )}

        {phase === 'called' && result && (
          <>
            <Card accent={playerWon ? 'green' : 'red'} className="mb-4 text-center">
              {playerWon ? (
                <div className="flex flex-col items-center gap-2">
                  <Trophy size={32} className="text-gold-campaign" />
                  <p className="text-lg font-black text-success">VICTORY!</p>
                  <p className="text-sm text-text-secondary">
                    Steve Gonzalez wins NV-03 by {formatPercent(Math.abs(result.margin))}
                  </p>
                  {result.recount && (
                    <p className="text-xs text-gold-campaign">After automatic recount</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <XCircle size={32} className="text-danger" />
                  <p className="text-lg font-black text-danger">DEFEAT</p>
                  <p className="text-sm text-text-secondary">
                    Susie Lee holds NV-03 by {formatPercent(Math.abs(result.margin))}
                  </p>
                </div>
              )}
            </Card>

            {/* Demographic Breakdown */}
            <Card className="mb-4">
              <h3 className="text-sm font-bold text-text-primary mb-3">Demographic Breakdown</h3>
              {result.demographic_breakdown.map((d) => {
                const demo = polls.demographics.find((dd) => dd.id === d.demographic);
                return (
                  <div key={d.demographic} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">{demo?.name ?? d.demographic}</span>
                      <span className={d.player_pct > d.opponent_pct ? 'text-success' : 'text-danger'}>
                        {formatPercent(d.player_pct)} - {formatPercent(d.opponent_pct)}
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-bg-elevated">
                      <div className="bg-red-campaign" style={{ width: `${d.player_pct}%` }} />
                      <div className="bg-blue-campaign" style={{ width: `${d.opponent_pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </Card>

            <Button fullWidth size="lg" onClick={() => navigate('/postgame')}>
              View Final Score →
            </Button>
          </>
        )}
      </PageContainer>
    </div>
  );
}
