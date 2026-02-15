import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { calculateElectionResult, calculatePostGameScore } from '@/engine/ElectionEngine.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { formatMoney, formatPercent } from '@/utils/formatters.ts';
import { Trophy, Star, DollarSign, Users, Target, Award } from 'lucide-react';

export function PostGame() {
  const navigate = useNavigate();
  const resetGame = useGameStore((s) => s.resetGame);
  const polls = useGameStore((s) => s.polls);
  const finances = useGameStore((s) => s.finances);
  const endorsements = useGameStore((s) => s.endorsements);
  const staff = useGameStore((s) => s.staff);
  const opponent = useGameStore((s) => s.opponent);
  const seed = useGameStore((s) => s.seed);
  const difficulty = useGameStore((s) => s.difficulty);
  const gotv = useGameStore((s) => s.gotv_investment);

  const { score } = useMemo(() => {
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
    const r = calculateElectionResult(gameState, rng);
    const s = calculatePostGameScore(r, gameState);
    return { result: r, score: s };
  }, [seed, difficulty, endorsements, finances, gotv, opponent, polls, staff]);

  const gradeColor = score.final_grade.startsWith('A') ? 'text-success' :
    score.final_grade.startsWith('B') ? 'text-info' :
    score.final_grade.startsWith('C') ? 'text-warning' : 'text-danger';

  return (
    <div className="min-h-screen bg-bg-primary">
      <PageContainer>
        <div className="text-center mb-6 pt-4">
          <Award size={40} className={score.victory ? 'text-gold-campaign mx-auto' : 'text-text-muted mx-auto'} />
          <h1 className="text-2xl font-black text-text-primary mt-2">CAMPAIGN REPORT</h1>
          <p className="text-sm text-text-secondary">Final Assessment</p>
        </div>

        {/* Grade */}
        <Card className="mb-4 text-center">
          <p className="text-xs text-text-muted uppercase tracking-wider">Final Grade</p>
          <p className={`text-6xl font-black ${gradeColor}`}>{score.final_grade}</p>
          <p className="text-sm text-text-secondary mt-1">Score: {score.total_score} pts</p>
        </Card>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={14} className="text-gold-campaign" />
              <p className="text-xs text-text-muted">Result</p>
            </div>
            <p className={`text-lg font-bold ${score.victory ? 'text-success' : 'text-danger'}`}>
              {score.victory ? 'VICTORY' : 'DEFEAT'}
            </p>
            <p className="text-xs text-text-secondary">
              {score.margin > 0 ? '+' : ''}{formatPercent(score.margin)}
            </p>
          </Card>
          
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-success" />
              <p className="text-xs text-text-muted">Funds Remaining</p>
            </div>
            <p className="text-lg font-bold text-text-primary">{formatMoney(score.funds_remaining)}</p>
          </Card>
          
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Star size={14} className="text-gold-campaign" />
              <p className="text-xs text-text-muted">Endorsements</p>
            </div>
            <p className="text-lg font-bold text-text-primary">
              {score.endorsements_won}/{score.total_endorsements}
            </p>
          </Card>
          
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-info" />
              <p className="text-xs text-text-muted">Peak Support</p>
            </div>
            <p className="text-lg font-bold text-text-primary">{formatPercent(score.approval_peak)}</p>
          </Card>
        </div>

        {/* Staff Hired */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-text-muted" />
            <h3 className="text-sm font-bold text-text-primary">Staff</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {staff.filter((s) => s.hired).map((s) => (
              <Badge key={s.id} variant="success">{s.name}</Badge>
            ))}
            {staff.filter((s) => !s.hired).map((s) => (
              <Badge key={s.id} variant="default">{s.name}</Badge>
            ))}
          </div>
        </Card>

        {/* Endorsements */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-gold-campaign" />
            <h3 className="text-sm font-bold text-text-primary">Endorsements</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {endorsements.filter((e) => e.secured).map((e) => (
              <Badge key={e.id} variant="success">{e.name}</Badge>
            ))}
            {endorsements.filter((e) => !e.secured).map((e) => (
              <Badge key={e.id} variant="default">{e.name}</Badge>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Button fullWidth size="lg" onClick={() => { resetGame(); navigate('/new-game'); }}>
            New Campaign
          </Button>
          <Button fullWidth size="lg" variant="secondary" onClick={() => { resetGame(); navigate('/'); }}>
            Main Menu
          </Button>
        </div>
      </PageContainer>
    </div>
  );
}
