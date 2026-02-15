import type { StaffMember } from '@/types/game.ts';
import type { AllocatedAction } from '@/types/actions.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';

export interface GOTVResult {
  investment_added: number;
  total_investment: number;
  estimated_turnout_bonus: number;
}

export function calculateGOTV(
  currentInvestment: number,
  actions: AllocatedAction[],
  staff: StaffMember[],
  currentTurn: number,
): GOTVResult {
  if (currentTurn < GAME_CONSTANTS.GOTV_AVAILABLE_TURN) {
    return {
      investment_added: 0,
      total_investment: currentInvestment,
      estimated_turnout_bonus: 0,
    };
  }

  const gotvActions = actions.filter((a) => a.type === 'gotv');
  const hasFieldDirector = staff.some((s) => s.role === 'field-director' && s.hired);

  let investmentAdded = 0;
  for (const action of gotvActions) {
    let amount = GAME_CONSTANTS.GOTV_BASE_INVESTMENT * action.intensity;
    if (hasFieldDirector) amount *= (1 + GAME_CONSTANTS.FIELD_DIRECTOR_GOTV_BONUS);
    investmentAdded += amount;
  }

  const totalInvestment = currentInvestment + investmentAdded;
  const rawBonus = totalInvestment * GAME_CONSTANTS.GOTV_TURNOUT_MULTIPLIER / 100000;
  const estimatedBonus = Math.min(rawBonus, GAME_CONSTANTS.GOTV_FINAL_EFFECT_MAX);

  return {
    investment_added: investmentAdded,
    total_investment: totalInvestment,
    estimated_turnout_bonus: estimatedBonus,
  };
}

export function isGOTVAvailable(currentTurn: number): boolean {
  return currentTurn >= GAME_CONSTANTS.GOTV_AVAILABLE_TURN;
}
