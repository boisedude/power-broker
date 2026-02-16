import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button.tsx';
import { useGameStore } from '@/store/useGameStore.ts';

export function MainMenu() {
  const navigate = useNavigate();
  const initialized = useGameStore((s) => s.initialized);

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      {/* Hero background — subtle rally image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: 'url(/images/steve-rally.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/50 via-bg-primary/70 to-bg-primary" />

      {/* Content */}
      <div className="relative flex flex-col items-center min-h-screen px-6 pt-10 pb-8">
        {/* Logo */}
        <img
          src="/images/logo-pb.png"
          alt="Campaign Manager: Nevada 3rd District"
          className="w-32 h-32 mb-4 drop-shadow-lg"
        />
        <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-1">
          POWER<span className="text-red-campaign">BROKER</span>
        </h1>

        {/* Steve hero portrait */}
        <div className="relative mb-5">
          <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-red-campaign shadow-2xl shadow-red-campaign/30">
            <img
              src="/images/steve-profile.jpg"
              alt="Steve Gonzalez"
              className="w-full h-full object-cover object-[center_25%]"
            />
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-full bg-red-campaign/10 blur-2xl -z-10 scale-125" />
        </div>

        {/* Hook text */}
        <h2 className="text-2xl font-bold text-text-primary text-center leading-tight mb-2">
          Can you send Steve<br />to Congress?
        </h2>

        {/* Pitch */}
        <p className="text-text-secondary text-sm text-center leading-relaxed max-w-xs mb-6">
          He's a former pro soccer player, a real estate developer,
          and a father of three. He's never run for office.
          Do you have what it takes to turn him into a <span className="text-text-primary font-semibold">Congressman</span>?
        </p>

        {/* Congress aspiration image */}
        <div className="w-full max-w-xs rounded-xl overflow-hidden border border-border-primary shadow-lg mb-6">
          <div className="relative">
            <img
              src="/images/steve-congress.jpg"
              alt="Steve Gonzalez on the House floor"
              className="w-full h-36 object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
              <p className="text-xs text-text-secondary italic">
                The goal: unseat a four-term incumbent in Nevada's 3rd District.
              </p>
            </div>
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

        <p className="text-xs text-text-muted mt-6">NV-03 | Cook PVI: D+1</p>
      </div>
    </div>
  );
}
