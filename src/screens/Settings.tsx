import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Button } from '@/components/ui/Button.tsx';

export function Settings() {
  const navigate = useNavigate();
  const animationsEnabled = useGameStore((s) => s.animations_enabled);
  const autoSave = useGameStore((s) => s.auto_save);
  const toggleAnimations = useGameStore((s) => s.toggleAnimations);
  const toggleAutoSave = useGameStore((s) => s.toggleAutoSave);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <PageContainer title="Settings">
      <Card className="mb-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-primary">Animations</span>
            <button
              onClick={toggleAnimations}
              className={`w-12 h-6 rounded-full transition-colors ${animationsEnabled ? 'bg-success' : 'bg-bg-elevated'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-primary">Auto-Save</span>
            <button
              onClick={toggleAutoSave}
              className={`w-12 h-6 rounded-full transition-colors ${autoSave ? 'bg-success' : 'bg-bg-elevated'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoSave ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <Button variant="danger" fullWidth onClick={() => { resetGame(); navigate('/'); }}>
          Reset Campaign
        </Button>
      </Card>

      <Button variant="ghost" fullWidth onClick={() => window.history.back()}>
        Back
      </Button>
    </PageContainer>
  );
}
