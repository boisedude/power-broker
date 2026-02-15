import type { Endorsement, DemographicData, PollState } from '@/types/game.ts';
import type { AllocatedAction } from '@/types/actions.ts';

export interface EndorsementResult {
  secured: Endorsement[];
  progressed: Endorsement[];
}

export function processEndorsements(
  endorsements: Endorsement[],
  actions: AllocatedAction[],
  _polls: PollState,
): EndorsementResult {
  const seekActions = actions.filter((a) => a.type === 'seek-endorsement');
  const secured: Endorsement[] = [];
  const progressed: Endorsement[] = [];

  if (seekActions.length === 0) return { secured, progressed };

  for (const endorsement of endorsements) {
    if (endorsement.secured || !endorsement.pursued) continue;

    endorsement.turns_pursued += 1;

    if (endorsement.turns_pursued >= endorsement.turns_to_secure) {
      endorsement.secured = true;
      secured.push(endorsement);
    } else {
      progressed.push(endorsement);
    }
  }

  return { secured, progressed };
}

export function applyEndorsementEffects(
  endorsement: Endorsement,
  demographics: DemographicData[],
): void {
  for (const demo of demographics) {
    const effect = endorsement.demographic_effects[demo.id];
    if (effect) {
      demo.current_support = Math.min(100, Math.max(0, demo.current_support + effect));
    }
  }
}

export function canPursueEndorsement(
  endorsement: Endorsement,
  playerSupport: number,
): boolean {
  if (endorsement.secured || endorsement.pursued) return false;
  // Check basic requirements
  if (endorsement.requirements.includes('40%') && playerSupport < 40) return false;
  if (endorsement.requirements.includes('43%') && playerSupport < 43) return false;
  return true;
}
