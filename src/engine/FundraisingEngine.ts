import type { CampaignFinances, StaffMember } from '@/types/game.ts';
import type { AllocatedAction } from '@/types/actions.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';

export interface FundraisingResult {
  total_raised: number;
  small_donors: number;
  large_donors: number;
  pac_money: number;
  online_income: number;
  email_list_growth: number;
}

export function calculateFundraising(
  finances: CampaignFinances,
  actions: AllocatedAction[],
  staff: StaffMember[],
  momentum: number,
  _turn: number,
  rng: SeededRandom,
): FundraisingResult {
  const hasFinanceDirector = staff.some((s) => s.role === 'finance-director' && s.hired);
  const hasDigitalDirector = staff.some((s) => s.role === 'digital-director' && s.hired);
  const fundraiseActions = actions.filter((a) => a.type === 'fundraise');

  let smallDonors = 0;
  let largeDonors = 0;
  let pacMoney = 0;

  for (const action of fundraiseActions) {
    const directorBonus = hasFinanceDirector ? (1 + GAME_CONSTANTS.FINANCE_DIRECTOR_BONUS) : 1;
    const momentumBonus = 1 + (momentum * 0.02);
    const noise = rng.nextFloat(0.85, 1.15);

    const smallDonorAmount = GAME_CONSTANTS.SMALL_DONOR_BASE * action.intensity * directorBonus * momentumBonus * noise;
    smallDonors += smallDonorAmount;

    const largeDonorMultiplier = Math.pow(GAME_CONSTANTS.LARGE_DONOR_DIMINISHING_FACTOR, finances.large_donors / 100000);
    const largeDonorAmount = GAME_CONSTANTS.LARGE_DONOR_BASE * action.intensity * directorBonus * largeDonorMultiplier * noise;
    largeDonors += largeDonorAmount;
  }

  // Online passive income
  let onlineIncome = finances.online_income_rate;
  if (hasDigitalDirector) {
    onlineIncome *= (1 + GAME_CONSTANTS.DIGITAL_DIRECTOR_ONLINE_BONUS);
  }
  onlineIncome *= (1 + (momentum * 0.01));

  // Email list growth
  const emailGrowth = fundraiseActions.length * GAME_CONSTANTS.EMAIL_LIST_GROWTH_PER_FUNDRAISE;

  const totalRaised = smallDonors + largeDonors + pacMoney + onlineIncome;

  return {
    total_raised: totalRaised,
    small_donors: smallDonors,
    large_donors: largeDonors,
    pac_money: pacMoney,
    online_income: onlineIncome,
    email_list_growth: emailGrowth,
  };
}
