import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Mic } from 'lucide-react';

export function DebateScreen() {
  const activeEvents = useGameStore((s) => s.active_events);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const setTurnPhase = useGameStore((s) => s.setTurnPhase);

  const debateEvent = activeEvents.find((e) => e.event.category === 'debate' && !e.resolved);

  if (!debateEvent) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <Mic size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-secondary">No debate scheduled this week.</p>
          <Button variant="secondary" className="mt-4" onClick={() => setTurnPhase('actions')}>
            Back to Actions
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="text-center mb-6">
        <Mic size={32} className="mx-auto text-red-campaign mb-2" />
        <h1 className="text-xl font-black text-text-primary">DEBATE NIGHT</h1>
        <p className="text-sm text-text-secondary mt-1">NV-03 Congressional Debate</p>
        <div className="flex justify-center items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <img src="/images/steve-profile.jpg" alt="Steve Gonzalez" className="w-10 h-10 rounded-full object-cover object-[center_25%] border-2 border-red-campaign" />
            <Badge variant="danger">Steve Gonzalez (R)</Badge>
          </div>
          <span className="text-text-muted font-bold">vs</span>
          <div className="flex items-center gap-2">
            <Badge variant="info">Susie Lee (D)</Badge>
            <img src="/images/susie-profile.jpg" alt="Susie Lee" className="w-10 h-10 rounded-full object-cover border-2 border-blue-campaign" />
          </div>
        </div>
      </div>

      <Card accent="gold" className="mb-4">
        <h3 className="text-base font-bold text-text-primary mb-2">{debateEvent.event.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{debateEvent.event.description}</p>
      </Card>

      <h4 className="text-sm font-bold text-text-primary mb-3">Your Response:</h4>
      <div className="space-y-2">
        {debateEvent.event.choices.map((choice) => (
          <Button
            key={choice.id}
            variant="secondary"
            fullWidth
            onClick={() => resolveEvent(debateEvent.event.id, choice.id)}
            className="text-left justify-start py-4"
          >
            <span className="text-sm leading-relaxed">{choice.text}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-text-muted text-center mt-4">
        Your debate performance will affect polls and campaign momentum.
      </p>
    </PageContainer>
  );
}
