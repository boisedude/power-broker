import type { ActionType } from '@/types/game.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Banknote, Users, Handshake, Search, BookOpen, Vote } from 'lucide-react';

interface ActionCardProps {
  type: ActionType;
  name: string;
  description: string;
  cost: number;
  disabled: boolean;
  count: number;
  onAllocate: () => void;
}

const iconMap: Record<ActionType, typeof Banknote> = {
  'fundraise': Banknote,
  'campaign': Users,
  'seek-endorsement': Handshake,
  'oppo-research': Search,
  'debate-prep': BookOpen,
  'gotv': Vote,
};

export function ActionCard({ type, name, description, cost, disabled, count, onAllocate }: ActionCardProps) {
  const Icon = iconMap[type];

  return (
    <Card className="flex items-center gap-3 transition-transform active:scale-[0.98]">
      <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center shrink-0">
        <Icon size={20} className="text-red-campaign" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{name}</span>
          {count > 0 && <Badge variant="success">{count}x</Badge>}
        </div>
        <p className="text-xs text-text-secondary line-clamp-2">{description}</p>
      </div>
      <Button size="sm" variant={disabled ? 'ghost' : 'primary'} disabled={disabled} onClick={onAllocate}>
        {cost} AP
      </Button>
    </Card>
  );
}
