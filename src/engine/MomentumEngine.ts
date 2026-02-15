import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { clamp } from '@/utils/formatters.ts';

export function calculateMomentum(
  currentMomentum: number,
  pollChange: number,
  eventsImpact: number,
  endorsementGained: boolean,
): number {
  let newMomentum = currentMomentum;

  // Natural decay toward 0
  if (newMomentum > 0) {
    newMomentum -= GAME_CONSTANTS.MOMENTUM_DECAY;
  } else if (newMomentum < 0) {
    newMomentum += GAME_CONSTANTS.MOMENTUM_DECAY;
  }

  // Poll movement creates momentum
  if (pollChange > 1) newMomentum += 1;
  else if (pollChange > 0.5) newMomentum += 0.5;
  else if (pollChange < -1) newMomentum -= 1;
  else if (pollChange < -0.5) newMomentum -= 0.5;

  // Events impact
  newMomentum += eventsImpact;

  // Endorsement boost
  if (endorsementGained) {
    newMomentum += 1.5;
  }

  return clamp(newMomentum, GAME_CONSTANTS.MOMENTUM_MIN, GAME_CONSTANTS.MOMENTUM_MAX);
}

export function getMomentumLabel(momentum: number): string {
  if (momentum >= 5) return 'Surging';
  if (momentum >= 2) return 'Building';
  if (momentum > 0) return 'Slight edge';
  if (momentum === 0) return 'Neutral';
  if (momentum > -2) return 'Headwinds';
  if (momentum > -5) return 'Struggling';
  return 'Collapsing';
}

export function getMomentumColor(momentum: number): string {
  if (momentum >= 3) return 'text-green-400';
  if (momentum > 0) return 'text-green-300';
  if (momentum === 0) return 'text-gray-400';
  if (momentum > -3) return 'text-red-300';
  return 'text-red-400';
}
