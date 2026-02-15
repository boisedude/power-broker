import type { StaffMember } from '@/types/game.ts';
import { Card } from '@/components/ui/Card.tsx';
import { Badge } from '@/components/ui/Badge.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { formatMoney } from '@/utils/formatters.ts';
import { getStaffBenefitDescription } from '@/engine/StaffEngine.ts';
import { User } from 'lucide-react';

interface StaffCardProps {
  member: StaffMember;
  canAfford: boolean;
  onHire: () => void;
}

export function StaffCard({ member, canAfford, onHire }: StaffCardProps) {
  return (
    <Card className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
        <User size={18} className={member.hired ? 'text-success' : 'text-text-muted'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-text-primary">{member.name}</span>
          {member.hired && <Badge variant="success">Hired</Badge>}
        </div>
        <p className="text-xs text-text-secondary capitalize">{member.role.replace('-', ' ')}</p>
        <p className="text-xs text-gold-campaign mt-1">{getStaffBenefitDescription(member.role)}</p>
        <p className="text-xs text-text-muted">{formatMoney(member.cost)}/week</p>
      </div>
      {!member.hired && (
        <Button size="sm" variant="secondary" disabled={!canAfford} onClick={onHire}>
          Hire
        </Button>
      )}
    </Card>
  );
}
