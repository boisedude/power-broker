import type { GameEvent, ActiveEvent, EventChoice, EventEffect } from '@/types/events.ts';
import type { GameState, DemographicData } from '@/types/game.ts';
import { GAME_CONSTANTS, getPhaseForTurn } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';

import nationalEvents from '@/data/events/national-events.json';
import localEvents from '@/data/events/local-events.json';
import campaignEvents from '@/data/events/campaign-events.json';
import opponentEvents from '@/data/events/opponent-events.json';
import debateEvents from '@/data/events/debate-events.json';

const ALL_EVENTS: GameEvent[] = [
  ...(nationalEvents as unknown as GameEvent[]),
  ...(localEvents as unknown as GameEvent[]),
  ...(campaignEvents as unknown as GameEvent[]),
  ...(opponentEvents as unknown as GameEvent[]),
  ...(debateEvents as unknown as GameEvent[]),
];

export function generateTurnEvents(
  state: GameState,
  eventHistory: string[],
  rng: SeededRandom,
): ActiveEvent[] {
  const currentPhase = getPhaseForTurn(state.current_turn);
  const events: ActiveEvent[] = [];

  // Check for scheduled debate events first
  const debateEvent = ALL_EVENTS.find(
    (e) =>
      e.category === 'debate' &&
      e.turn_range &&
      e.turn_range[0] === state.current_turn &&
      !eventHistory.includes(e.id),
  );
  if (debateEvent) {
    events.push({ event: debateEvent, resolved: false, turn: state.current_turn });
  }

  // Filter eligible events
  const eligible = ALL_EVENTS.filter((e) => {
    if (e.category === 'debate' && e.turn_range) return false; // handled above
    if (e.one_time && eventHistory.includes(e.id)) return false;

    const phases = getPhaseRange(e.phase_range[0], e.phase_range[1]);
    if (!phases.includes(currentPhase)) return false;

    if (e.turn_range && (state.current_turn < e.turn_range[0] || state.current_turn > e.turn_range[1])) {
      return false;
    }

    if (e.prerequisites) {
      for (const prereq of e.prerequisites) {
        if (!checkPrerequisite(prereq, state)) return false;
      }
    }

    return true;
  });

  // Roll for random events (max 2 per turn)
  const maxEvents = GAME_CONSTANTS.EVENTS_PER_TURN_MAX - events.length;
  const shuffled = rng.shuffle(eligible);

  for (const event of shuffled) {
    if (events.length >= maxEvents + (debateEvent ? 1 : 0)) break;
    if (rng.chance(event.probability)) {
      events.push({ event, resolved: false, turn: state.current_turn });
    }
  }

  return events;
}

export function resolveEventChoice(
  choice: EventChoice,
  _state: GameState,
  rng: SeededRandom,
): { effects: EventEffect[]; notifications: string[] } {
  const effects: EventEffect[] = [];
  const notifications: string[] = [];

  for (const effect of choice.effects) {
    effects.push(effect);
    notifications.push(effect.description);
  }

  // Check for risk outcomes
  if (choice.risk && rng.chance(choice.risk.probability)) {
    for (const badEffect of choice.risk.bad_outcome) {
      effects.push(badEffect);
      notifications.push(`Risk: ${badEffect.description}`);
    }
  }

  return { effects, notifications };
}

export function applyEventEffects(
  effects: EventEffect[],
  state: GameState,
): void {
  for (const effect of effects) {
    switch (effect.type) {
      case 'poll_change':
        state.polls.player_support = clamp(state.polls.player_support + effect.value, 0, 100);
        break;
      case 'cash_change':
        state.finances.cash_on_hand += effect.value;
        break;
      case 'momentum_change':
        state.momentum = clamp(state.momentum + effect.value, -10, 10);
        break;
      case 'demographic_change':
        if (effect.demographic) {
          const demo = state.polls.demographics.find((d: DemographicData) => d.id === effect.demographic);
          if (demo) {
            demo.current_support = clamp(demo.current_support + effect.value, 0, 100);
          }
        }
        break;
      case 'opponent_change':
        state.opponent.approval_rating = clamp(state.opponent.approval_rating + effect.value, 0, 100);
        state.polls.opponent_support = clamp(state.polls.opponent_support + effect.value, 0, 100);
        break;
      case 'gotv_change':
        state.gotv_investment += effect.value;
        break;
      case 'email_list_change':
        state.finances.email_list_size += effect.value;
        break;
    }
  }
}

function getPhaseRange(start: string, end: string): string[] {
  const phases = ['primary', 'early', 'mid', 'final', 'election'];
  const startIdx = phases.indexOf(start);
  const endIdx = phases.indexOf(end);
  if (startIdx === -1 || endIdx === -1) return [];
  return phases.slice(startIdx, endIdx + 1);
}

function checkPrerequisite(
  prereq: { type: string; value: number | string },
  state: GameState,
): boolean {
  switch (prereq.type) {
    case 'poll_above':
      return state.polls.player_support > (prereq.value as number);
    case 'poll_below':
      return state.polls.player_support < (prereq.value as number);
    case 'cash_above':
      return state.finances.cash_on_hand > (prereq.value as number);
    case 'cash_below':
      return state.finances.cash_on_hand < (prereq.value as number);
    case 'has_staff':
      return state.staff.some((s) => s.role === prereq.value && s.hired);
    case 'momentum_above':
      return state.momentum > (prereq.value as number);
    case 'momentum_below':
      return state.momentum < (prereq.value as number);
    default:
      return true;
  }
}
