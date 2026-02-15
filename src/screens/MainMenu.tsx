import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button.tsx';
import { useGameStore } from '@/store/useGameStore.ts';

export function MainMenu() {
  const navigate = useNavigate();
  const initialized = useGameStore((s) => s.initialized);

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: 'url(/images/steve-rally.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-bg-primary/80 to-bg-primary" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-text-primary tracking-tighter mb-2">
            POWER<span className="text-red-campaign">BROKER</span>
          </h1>
          <p className="text-text-secondary text-sm">A Political Campaign Simulation</p>
        </div>

        {/* Narrative flavor card */}
        <div className="w-full max-w-sm bg-bg-elevated/80 backdrop-blur-sm rounded-xl border border-border-primary p-4 mb-8">
          <p className="text-text-secondary text-sm leading-relaxed">
            <span className="text-text-primary font-semibold">June 2026.</span>{' '}
            Steve Gonzalez — former pro soccer player, real estate developer, first-time candidate —
            is challenging four-term incumbent Susie Lee for Nevada's 3rd Congressional District.
          </p>
          <p className="text-text-muted text-xs mt-2">NV-03 | Cook PVI: D+1</p>
        </div>

        {/* Candidate portraits */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="text-center">
            <img
              src="/images/steve-profile.jpg"
              alt="Steve Gonzalez"
              className="w-20 h-20 rounded-full object-cover object-[center_25%] border-2 border-red-campaign mx-auto shadow-lg shadow-red-campaign/20"
            />
            <p className="text-xs text-red-campaign mt-2 font-medium">Gonzalez (R)</p>
          </div>
          <span className="text-text-muted font-bold text-xl">vs</span>
          <div className="text-center">
            <img
              src="/images/susie-profile.jpg"
              alt="Susie Lee"
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-campaign mx-auto shadow-lg shadow-blue-campaign/20"
            />
            <p className="text-xs text-blue-campaign mt-2 font-medium">Lee (D)</p>
          </div>
        </div>

        {/* Buttons */}
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

        <p className="text-xs text-text-muted mt-8">Nevada's 3rd Congressional District</p>
      </div>
    </div>
  );
}
