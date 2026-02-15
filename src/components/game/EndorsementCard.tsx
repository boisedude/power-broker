import type { Endorsement } from '@/types/game.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { ProgressBar } from '@/components/ui/ProgressBar.tsx';
import { formatMoney } from '@/utils/formatters.ts';
import { Star } from 'lucide-react';

interface EndorsementCardProps {
  endorsement: Endorsement;
  canPursue: boolean;
  onPursue: () => void;
}

export function EndorsementCard({ endorsement, canPursue, onPursue }: EndorsementCardProps) {
  return (
    <Card accent={endorsement.secured ? 'gold' : 'none'}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
          <Star size={16} className={endorsement.secured ? 'text-gold-campaign fill-gold-campaign' : 'text-text-muted'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text-primary">{endorsement.name}</span>
            {endorsement.secured && <Badge variant="success">Secured</Badge>}
            {endorsement.pursued && !endorsement.secured && <Badge variant="warning">Pursuing</Badge>}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{endorsement.description}</p>
          {endorsement.fundraising_bonus > 0 && (
            <p className="text-xs text-success mt-1">+{formatMoney(endorsement.fundraising_bonus)} fundraising</p>
          )}
          {endorsement.pursued && !endorsement.secured && (
            <ProgressBar
              value={endorsement.turns_pursued}
              max={endorsement.turns_to_secure}
              color="gold"
              height="sm"
              className="mt-2"
            />
          )}
        </div>
        {!endorsement.secured && !endorsement.pursued && (
          <Button size="sm" variant="secondary" disabled={!canPursue} onClick={onPursue}>
            Pursue
          </Button>
        )}
      </div>
    </Card>
  );
}
