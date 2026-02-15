import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';
import type { ActiveEvent } from '@/types/events.ts';
import type { EventEffect } from '@/types/events.ts';
import { clamp } from '@/utils/formatters.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';

export type EventSliceState = {
  active_events: ActiveEvent[];
  event_history: ActiveEvent[];
  current_event_index: number;
  addEvent: (event: ActiveEvent) => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  clearActiveEvents: () => void;
};

export const createEventSlice: StateCreator<GameStore, [['zustand/immer', never]], [], EventSliceState> = (set) => ({
  active_events: [],
  event_history: [],
  current_event_index: 0,

  addEvent: (event) =>
    set((state) => {
      state.active_events.push(event);
    }),

  resolveEvent: (eventId, choiceId) =>
    set((state) => {
      const event = state.active_events.find((e) => e.event.id === eventId);
      if (!event) return;

      const choice = event.event.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      // Mark as resolved
      event.chosen = choiceId;
      event.resolved = true;

      // Collect effects (including risk outcomes)
      const effects: EventEffect[] = [...choice.effects];
      if (choice.risk) {
        const rng = new SeededRandom(state.seed + state.current_turn * 5000 + state.current_event_index);
        if (rng.chance(choice.risk.probability)) {
          effects.push(...choice.risk.bad_outcome);
        }
      }

      // Apply effects directly to state (inside immer draft)
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
              const demo = state.polls.demographics.find((d) => d.id === effect.demographic);
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

      // Advance to next event or transition to actions phase
      state.current_event_index += 1;
      const allResolved = state.active_events.every((e) => e.resolved);
      if (allResolved) {
        state.turn_phase = 'actions';
      }
    }),

  clearActiveEvents: () =>
    set((state) => {
      state.event_history.push(...state.active_events.filter((e) => e.resolved));
      state.active_events = [];
      state.current_event_index = 0;
    }),
});
