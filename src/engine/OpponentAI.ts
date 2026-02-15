import type { OpponentState, OpponentStrategy } from '@/types/game.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';

export interface OpponentTurnResult {
  actions: string[];
  cash_spent: number;
  poll_effect: number;
  new_strategy: OpponentStrategy;
  gotv_added: number;
}

function getCampaignChance(currentTurn: number): number {
  if (currentTurn <= 6) return 0.5;   // primary — less active
  if (currentTurn <= 14) return 0.7;  // early — standard
  return 0.85;                         // mid/final — aggressive
}

export function processOpponentTurn(
  opponent: OpponentState,
  playerSupport: number,
  opponentSupport: number,
  currentTurn: number,
  rng: SeededRandom,
): OpponentTurnResult {
  const actions: string[] = [];
  let cashSpent = 0;
  let pollEffect = 0;
  let gotvAdded = 0;

  const margin = opponentSupport - playerSupport;
  const newStrategy = determineStrategy(opponent, margin, currentTurn);

  // Fundraising (opponent always fundraises)
  const fundraisingAmount = GAME_CONSTANTS.OPPONENT_BASE_FUNDRAISING * (1 + rng.nextFloat(-0.1, 0.2));
  opponent.cash_on_hand += fundraisingAmount;
  actions.push(`Lee raised ${formatK(fundraisingAmount)} this week`);

  // Ad spending based on strategy
  let adSpend = opponent.ad_spending;
  if (newStrategy === 'aggressive') {
    adSpend *= 1.5;
    actions.push('Lee increased ad spending with attack ads');
    pollEffect += GAME_CONSTANTS.OPPONENT_ATTACK_POLL_EFFECT * 0.5;
  } else if (newStrategy === 'defensive') {
    adSpend *= 0.8;
    actions.push('Lee is running positive constituent service ads');
    pollEffect += 0.3;
  } else {
    actions.push('Lee is running standard campaign ads');
    pollEffect += 0.2;
  }

  cashSpent += adSpend;

  // Campaigning — phase-dependent activity level
  if (rng.chance(getCampaignChance(currentTurn))) {
    const campaignEffect = 0.3 * (1 + opponent.staff_level * 0.1);
    pollEffect += campaignEffect;
    const locations = ['Summerlin', 'Spring Valley', 'Enterprise', 'Henderson'];
    actions.push(`Lee campaigned in ${rng.pick(locations)}`);
  }

  // Attack mode logic
  if (margin < GAME_CONSTANTS.OPPONENT_ADAPTATION_THRESHOLD && !opponent.attack_mode) {
    opponent.attack_mode = true;
    actions.push('Lee\'s campaign has shifted to attack mode');
    pollEffect += 0.5;
  } else if (margin > 3 && opponent.attack_mode) {
    opponent.attack_mode = false;
    actions.push('Lee has returned to a positive campaign strategy');
  }

  // GOTV (late game)
  if (currentTurn >= GAME_CONSTANTS.GOTV_AVAILABLE_TURN) {
    const gotvSpend = 15000 + rng.nextInt(0, 10000);
    gotvAdded = gotvSpend;
    cashSpent += gotvSpend;
    actions.push(`Lee invested ${formatK(gotvSpend)} in GOTV operations`);
  }

  // Endorsement activity — reduced chance and effect
  if (rng.chance(0.10) && currentTurn > 5) {
    const orgs = ['AFL-CIO Nevada', 'Sierra Club', 'Las Vegas Sun', 'Clark County Education Association'];
    const org = rng.pick(orgs.filter((o) => !opponent.endorsements_secured.includes(o)));
    if (org) {
      opponent.endorsements_secured.push(org);
      actions.push(`Lee secured endorsement from ${org}`);
      pollEffect += 0.15;
    }
  }

  // Apply spending
  opponent.cash_on_hand = Math.max(0, opponent.cash_on_hand - cashSpent);
  opponent.total_spent += cashSpent;
  opponent.ad_spending = adSpend;
  opponent.strategy = newStrategy;
  opponent.gotv_investment += gotvAdded;

  return {
    actions,
    cash_spent: cashSpent,
    poll_effect: pollEffect,
    new_strategy: newStrategy,
    gotv_added: gotvAdded,
  };
}

function determineStrategy(
  _opponent: OpponentState,
  margin: number,
  currentTurn: number,
): OpponentStrategy {
  // Early game: always establishment unless significantly behind
  if (currentTurn <= 10) {
    return margin < -5 ? 'aggressive' : 'establishment';
  }

  // If leading comfortably, play it safe
  if (margin > 5) return 'establishment';

  // If close lead, protect it in late game
  if (margin > 0 && margin <= 5) {
    return currentTurn > 20 ? 'defensive' : 'establishment';
  }

  // If tied or slightly behind (-5 to 0)
  if (margin >= -5) {
    return currentTurn > 15 ? 'aggressive' : 'establishment';
  }

  // If significantly behind (< -5), go aggressive
  return 'aggressive';
}

export function getOpponentPollEffect(
  result: OpponentTurnResult,
  _currentOpponentSupport: number,
): number {
  return clamp(result.poll_effect, -2, 2);
}

function formatK(n: number): string {
  return `$${Math.round(n / 1000)}K`;
}
