import type { PollState, AdCampaign, StaffMember } from '@/types/game.ts';
import type { AllocatedAction } from '@/types/actions.ts';
import type { PollChange } from '@/types/engine.ts';
import { calculateAdEffects } from '@/engine/AdvertisingEngine.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';

export function calculatePollChanges(
  polls: PollState,
  actions: AllocatedAction[],
  ads: AdCampaign[],
  momentum: number,
  staff: StaffMember[],
  rng: SeededRandom,
): { newPolls: PollState; changes: PollChange[] } {
  const changes: PollChange[] = [];
  const newDemographics = polls.demographics.map((d) => ({ ...d }));

  // Process campaign actions
  const campaignActions = actions.filter((a) => a.type === 'campaign');
  for (const action of campaignActions) {
    for (const demo of newDemographics) {
      if (action.target && action.target !== demo.id) continue;
      const baseBoost = GAME_CONSTANTS.CAMPAIGN_BASE_POLL_BOOST * action.intensity;
      const persuadabilityMod = demo.persuadability;
      const noise = rng.nextFloat(-0.3, 0.3);
      const change = baseBoost * persuadabilityMod + noise;

      if (Math.abs(change) > 0.1) {
        demo.current_support = clamp(demo.current_support + change, 0, 100);
        changes.push({
          demographic: demo.id,
          player_change: change,
          opponent_change: 0,
          reason: 'Campaign outreach',
        });
      }
    }
  }

  // Process advertising effects via AdvertisingEngine
  const adEffects = calculateAdEffects(ads, newDemographics, staff, rng);
  for (const effect of adEffects) {
    const demo = newDemographics.find((d) => d.id === effect.demographic);
    if (!demo) continue;
    demo.current_support = clamp(demo.current_support + effect.player_change, 0, 100);
    if (effect.opponent_change !== 0) {
      demo.opponent_support = clamp(demo.opponent_support + effect.opponent_change, 0, 100);
    }
    changes.push({
      demographic: effect.demographic,
      player_change: effect.player_change,
      opponent_change: effect.opponent_change,
      reason: effect.reason,
    });
  }

  // Momentum effect
  if (momentum !== 0) {
    const momentumEffect = momentum * GAME_CONSTANTS.MOMENTUM_POLL_EFFECT;
    for (const demo of newDemographics) {
      const change = momentumEffect * demo.persuadability * 0.3;
      demo.current_support = clamp(demo.current_support + change, 0, 100);
    }
  }

  // Undecided decay — shifts proportionally
  const undecidedDecay = polls.undecided * GAME_CONSTANTS.UNDECIDED_DECAY_RATE;

  // Calculate new aggregate polls from demographics
  let totalPlayerSupport = 0;
  let totalOpponentSupport = 0;
  for (const demo of newDemographics) {
    totalPlayerSupport += demo.current_support * (demo.electorate_pct / 100);
    totalOpponentSupport += demo.opponent_support * (demo.electorate_pct / 100);
  }

  const newUndecided = clamp(polls.undecided - undecidedDecay, 2, 30);

  const newPolls: PollState = {
    player_support: clamp(totalPlayerSupport, 0, 100 - newUndecided),
    opponent_support: clamp(totalOpponentSupport, 0, 100 - newUndecided),
    undecided: newUndecided,
    margin_of_error: polls.margin_of_error,
    demographics: newDemographics,
    history: [
      ...polls.history,
      {
        turn: polls.history.length + 1,
        player_support: totalPlayerSupport,
        opponent_support: totalOpponentSupport,
        undecided: newUndecided,
      },
    ],
  };

  return { newPolls, changes };
}
