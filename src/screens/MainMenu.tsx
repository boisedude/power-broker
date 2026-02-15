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

      <div className="mt-12 text-center">
        <div className="flex justify-center items-center gap-4 mb-2">
          <div className="text-center">
            <img src="/images/steve-profile.jpg" alt="Steve Gonzalez" className="w-14 h-14 rounded-full object-cover border-2 border-red-campaign mx-auto" />
            <p className="text-xs text-red-campaign mt-1 font-medium">Gonzalez (R)</p>
          </div>
          <span className="text-text-muted font-bold text-lg">vs</span>
          <div className="text-center">
            <img src="/images/susie-profile.jpg" alt="Susie Lee" className="w-14 h-14 rounded-full object-cover border-2 border-blue-campaign mx-auto" />
            <p className="text-xs text-blue-campaign mt-1 font-medium">Lee (D)</p>
          </div>
        </div>
        <p className="text-xs text-text-muted">Nevada's 3rd Congressional District</p>
      </div>
    </div>
  );
}
