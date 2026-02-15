import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button.tsx';
import { useGameStore } from '@/store/useGameStore.ts';

export function MainMenu() {
  const navigate = useNavigate();
  const initialized = useGameStore((s) => s.initialized);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-text-primary tracking-tight mb-2">
          POWER<span className="text-red-campaign">BROKER</span>
        </h1>
        <p className="text-text-secondary text-sm">A Political Campaign Simulation</p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Button fullWidth size="lg" onClick={() => navigate('/new-game')}>
          New Campaign
        </Button>
        {initialized && (
          <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/game')}>
            Continue Campaign
          </Button>
        )}
        <Button fullWidth size="lg" variant="ghost" onClick={() => navigate('/settings')}>
          Settings
        </Button>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-text-muted">NV-03 • Steve Gonzalez vs. Susie Lee</p>
      </div>
    </div>
  );
}
