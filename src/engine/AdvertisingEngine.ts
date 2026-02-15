import type { AdCampaign, StaffMember, DemographicData } from '@/types/game.ts';
import type { AdAllocation } from '@/types/actions.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';

export interface AdEffect {
  demographic: DemographicData['id'];
  player_change: number;
  opponent_change: number;
  reason: string;
}

export function calculateAdCost(ads: AdAllocation[]): number {
  return ads.reduce((total, ad) => total + ad.budget, 0);
}

export function getAdCostPerWeek(medium: AdCampaign['medium']): number {
  switch (medium) {
    case 'tv': return GAME_CONSTANTS.TV_COST_PER_WEEK;
    case 'digital': return GAME_CONSTANTS.DIGITAL_COST_PER_WEEK;
    case 'mailers': return GAME_CONSTANTS.MAILER_COST_PER_WEEK;
    case 'radio': return GAME_CONSTANTS.RADIO_COST_PER_WEEK;
  }
}

export function calculateAdEffects(
  ads: AdCampaign[],
  demographics: DemographicData[],
  staff: StaffMember[],
  rng: SeededRandom,
): AdEffect[] {
  const effects: AdEffect[] = [];
  const hasCommsDirector = staff.some((s) => s.role === 'comms-director' && s.hired);
  const hasDigitalDirector = staff.some((s) => s.role === 'digital-director' && s.hired);

  for (const ad of ads) {
    let reach = getAdReach(ad.medium);
    if (hasCommsDirector) reach *= (1 + GAME_CONSTANTS.COMMS_DIRECTOR_AD_BONUS);
    if (hasDigitalDirector && ad.medium === 'digital') {
      reach *= (1 + GAME_CONSTANTS.DIGITAL_DIRECTOR_TARGETING_BONUS);
    }

    const budgetMultiplier = ad.budget / getAdCostPerWeek(ad.medium);

    for (const demo of demographics) {
      if (ad.target_demographic && ad.target_demographic !== demo.id) continue;

      const targeting = ad.target_demographic === demo.id ? 1.5 : 0.6;
      let effectiveness = reach * demo.persuadability * targeting * budgetMultiplier;

      if (ad.tone === 'attack') {
        effectiveness *= 1.5;
        if (rng.chance(GAME_CONSTANTS.ATTACK_AD_BACKLASH_CHANCE)) {
          effects.push({
            demographic: demo.id,
            player_change: GAME_CONSTANTS.ATTACK_AD_BACKLASH_PENALTY,
            opponent_change: 0,
            reason: `Attack ad backlash with ${demo.name}`,
          });
          continue;
        }
      } else if (ad.tone === 'contrast') {
        effectiveness *= 1.2;
      }

      const noise = rng.nextFloat(-0.1, 0.1);
      const playerChange = effectiveness + noise;
      const opponentChange = (ad.tone === 'attack' || ad.tone === 'contrast') ? -playerChange * 0.4 : 0;

      effects.push({
        demographic: demo.id,
        player_change: playerChange,
        opponent_change: opponentChange,
        reason: `${ad.tone} ${ad.medium} ad${ad.target_demographic === demo.id ? ' (targeted)' : ''}`,
      });
    }
  }

  return effects;
}

function getAdReach(medium: AdCampaign['medium']): number {
  switch (medium) {
    case 'tv': return GAME_CONSTANTS.TV_REACH;
    case 'digital': return GAME_CONSTANTS.DIGITAL_REACH;
    case 'mailers': return GAME_CONSTANTS.MAILER_REACH;
    case 'radio': return GAME_CONSTANTS.RADIO_REACH;
  }
}
