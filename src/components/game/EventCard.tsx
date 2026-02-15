import type { GameEvent } from '@/types/events.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { AlertTriangle, Info, AlertCircle, Flame } from 'lucide-react';

interface EventCardProps {
  event: GameEvent;
  onChoose: (choiceId: string) => void;
}

const severityConfig = {
  minor: { icon: Info, color: 'text-info', badge: 'info' as const, label: 'Minor' },
  moderate: { icon: AlertCircle, color: 'text-warning', badge: 'warning' as const, label: 'Moderate' },
  major: { icon: AlertTriangle, color: 'text-danger', badge: 'danger' as const, label: 'Major' },
  crisis: { icon: Flame, color: 'text-danger', badge: 'danger' as const, label: 'Crisis' },
};

export function EventCard({ event, onChoose }: EventCardProps) {
  const config = severityConfig[event.severity];
  const Icon = config.icon;

  return (
    <Card accent={event.severity === 'crisis' ? 'red' : event.severity === 'major' ? 'gold' : 'none'}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`${config.color} mt-0.5`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-text-primary">{event.title}</h3>
            <Badge variant={config.badge}>{config.label}</Badge>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        {event.choices.map((choice) => (
          <Button
            key={choice.id}
            variant="secondary"
            fullWidth
            onClick={() => onChoose(choice.id)}
            className="text-left justify-start"
          >
            <span className="text-sm">{choice.text}</span>
          </Button>
        ))}
      </div>

      {event.choices[0]?.effects && (
        <div className="mt-3 pt-3 border-t border-navy-700">
          <p className="text-xs text-text-muted">Your choice will affect polls, fundraising, and campaign momentum.</p>
        </div>
      )}
    </Card>
  );
}
