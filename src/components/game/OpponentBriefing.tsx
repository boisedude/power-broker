import type { OpponentState } from '@/types/game.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { formatMoney } from '@/utils/formatters.ts';
import { DollarSign, Shield, Swords } from 'lucide-react';

interface OpponentBriefingProps {
  opponent: OpponentState;
  actions?: string[];
}

export function OpponentBriefing({ opponent, actions = [] }: OpponentBriefingProps) {
  return (
    <Card accent="blue">
      <div className="flex items-center gap-3 mb-3">
        <img src="/images/susie-profile.jpg" alt={opponent.name} className="w-10 h-10 rounded-full object-cover border-2 border-blue-campaign" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-campaign">Intelligence: {opponent.name}</h3>
        </div>
        {opponent.attack_mode && <Badge variant="danger">Attacking</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <DollarSign size={12} className="text-text-muted" />
          <span className="text-text-secondary">War Chest:</span>
          <span className="text-text-primary font-medium">{formatMoney(opponent.cash_on_hand)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={12} className="text-text-muted" />
          <span className="text-text-secondary">Staff:</span>
          <span className="text-text-primary font-medium">{opponent.staff_level}/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Swords size={12} className="text-text-muted" />
          <span className="text-text-secondary">Strategy:</span>
          <span className="text-text-primary font-medium capitalize">{opponent.strategy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-text-secondary">Ad Spend:</span>
          <span className="text-text-primary font-medium">{formatMoney(opponent.ad_spending)}/wk</span>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-navy-700">
          <p className="text-xs text-text-muted mb-1">Recent Actions:</p>
          {actions.map((a, i) => (
            <p key={i} className="text-xs text-text-secondary">• {a}</p>
          ))}
        </div>
      )}
    </Card>
  );
}
