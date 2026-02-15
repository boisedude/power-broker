import type { StaffMember, StaffRole, CampaignFinances } from '@/types/game.ts';

export function getWeeklyStaffCost(staff: StaffMember[]): number {
  return staff.filter((s) => s.hired).reduce((total, s) => total + s.cost, 0);
}

export function canAffordStaff(role: StaffRole, staff: StaffMember[], finances: CampaignFinances): boolean {
  const member = staff.find((s) => s.role === role && !s.hired);
  if (!member) return false;
  return finances.cash_on_hand >= member.cost * 4; // Need at least 4 weeks of salary
}

export function getStaffBenefitDescription(role: StaffRole): string {
  switch (role) {
    case 'campaign-manager': return '+1 Action Point per turn';
    case 'field-director': return 'GOTV effectiveness +40%';
    case 'comms-director': return 'Ad effectiveness +25%';
    case 'finance-director': return 'Fundraising income +30%';
    case 'digital-director': return 'Digital ads +35%, online fundraising +20%';
    case 'pollster': return 'Poll margin of error reduced to ±1.5%';
  }
}

export function isStaffAvailable(member: StaffMember, currentTurn: number): boolean {
  return currentTurn >= member.available_turn && !member.hired;
}
