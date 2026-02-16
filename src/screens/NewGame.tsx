import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore.ts';
import { DIFFICULTY_CONFIGS } from '@/engine/BalanceConstants.ts';
import { Button } from '@/components/ui/Button.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { ArrowLeft, DollarSign, TrendingUp, Shield, Swords, Skull } from 'lucide-react';
import type { DifficultyLevel } from '@/types/game.ts';

const DIFFICULTY_ICONS: Record<DifficultyLevel, React.ReactNode> = {
  'safe-seat': <Shield size={20} className="text-status-success" />,
  'lean': <TrendingUp size={20} className="text-blue-campaign" />,
  'toss-up': <DollarSign size={20} className="text-gold-campaign" />,
  'lean-away': <Swords size={20} className="text-status-warning" />,
  'hostile': <Skull size={20} className="text-status-danger" />,
};

const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'safe-seat',
  'lean',
  'toss-up',
  'lean-away',
  'hostile',
];

export function NewGame() {
  const navigate = useNavigate();
  const startNewGame = useGameStore((s) => s.startNewGame);

  const handleSelect = (difficulty: DifficultyLevel) => {
    startNewGame(difficulty);
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-text-muted text-sm mb-6 min-h-[48px]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Select Difficulty</h1>
          <p className="text-sm text-text-secondary">
            Choose how competitive the race will be
          </p>
        </div>

        <div className="space-y-3">
          {DIFFICULTY_ORDER.map((key) => {
            const config = DIFFICULTY_CONFIGS[key];
            const startingCashK = Math.round(config.starting_cash / 1000);

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="w-full text-left active:scale-[0.98] transition-transform"
              >
                <Card accent={key === 'toss-up' ? 'gold' : undefined} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {DIFFICULTY_ICONS[key]}
                    <div className="flex-1">
                      <h3 className="font-bold text-text-primary">{config.label}</h3>
                      <p className="text-xs text-text-secondary">{config.description}</p>
                    </div>
                    {key === 'toss-up' && (
                      <span className="text-[10px] font-semibold text-gold-campaign bg-gold-campaign/10 px-2 py-0.5 rounded-full">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex gap-4 text-xs text-text-muted pt-1 border-t border-navy-700/50">
                    <span>Starting: ${startingCashK}K</span>
                    <span>Polls: {config.player_starting_support}% - {config.opponent_starting_support}%</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
