import { useGameStore } from '@/store/useGameStore.ts';
import { PageContainer } from '@/components/layout/PageContainer.tsx';
import { EventCard } from '@/components/game/EventCard.tsx';

export function EventScreen() {
  const activeEvents = useGameStore((s) => s.active_events);
  const currentIndex = useGameStore((s) => s.current_event_index);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const setTurnPhase = useGameStore((s) => s.setTurnPhase);

  const currentEvent = activeEvents[currentIndex];
  const allResolved = activeEvents.every((e) => e.resolved);

  if (!currentEvent || allResolved) {
    return (
      <PageContainer title="Events">
        <div className="text-center py-12">
          <p className="text-text-secondary mb-4">No pending events this turn.</p>
          <button
            onClick={() => setTurnPhase('actions')}
            className="px-6 py-3 bg-red-campaign text-white rounded-lg font-semibold min-h-[48px]"
          >
            Continue to Actions
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Campaign Events">
      <p className="text-xs text-text-muted mb-4">
        Event {currentIndex + 1} of {activeEvents.length}
      </p>
      <EventCard
        event={currentEvent.event}
        onChoose={(choiceId) => {
          resolveEvent(currentEvent.event.id, choiceId);
        }}
      />
    </PageContainer>
  );
}
