import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';
import type { PollState } from '@/types/game.ts';

export type PollingSliceState = {
  polls: PollState;
  getLeadingCandidate: () => 'player' | 'opponent' | 'tied';
  getMargin: () => number;
  getDemographicSupport: (demographic: string) => { player: number; opponent: number };
};

export const createPollingSlice: StateCreator<GameStore, [['zustand/immer', never]], [], PollingSliceState> = (_set, get) => ({
  polls: {
    player_support: 45,
    opponent_support: 45,
    undecided: 10,
    margin_of_error: 3,
    demographics: [],
    history: [],
  },

  getLeadingCandidate: () => {
    const { polls } = get();
    if (polls.player_support > polls.opponent_support) return 'player';
    if (polls.opponent_support > polls.player_support) return 'opponent';
    return 'tied';
  },

  getMargin: () => {
    const { polls } = get();
    return polls.player_support - polls.opponent_support;
  },

  getDemographicSupport: (demographic) => {
    const { polls } = get();
    const demo = polls.demographics.find((d) => d.id === demographic);
    return {
      player: demo?.current_support ?? 0,
      opponent: demo?.opponent_support ?? 0,
    };
  },
});
