import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';

export type TurnSliceState = {
  current_turn: number;
  max_turns: number;
  phase: 'primary' | 'early' | 'mid' | 'final' | 'election';
  actions_remaining: number;
  turn_phase: 'briefing' | 'events' | 'actions' | 'ads' | 'resolution';
  last_turn_result: GameStore['last_turn_result'];
  advanceTurnPhase: () => void;
  setTurnPhase: (phase: TurnSliceState['turn_phase']) => void;
};

export const createTurnSlice: StateCreator<GameStore, [['zustand/immer', never]], [], TurnSliceState> = (set) => ({
  current_turn: 1,
  max_turns: 26,
  phase: 'primary',
  actions_remaining: 5,
  turn_phase: 'briefing',
  last_turn_result: null,

  advanceTurnPhase: () =>
    set((state) => {
      const phases: TurnSliceState['turn_phase'][] = ['briefing', 'events', 'actions', 'ads', 'resolution'];
      const currentIndex = phases.indexOf(state.turn_phase);
      if (currentIndex < phases.length - 1) {
        state.turn_phase = phases[currentIndex + 1];
      }
    }),

  setTurnPhase: (phase) =>
    set((state) => {
      state.turn_phase = phase;
    }),
});
