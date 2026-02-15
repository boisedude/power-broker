import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';
import type { OpponentState } from '@/types/game.ts';

export type OpponentSliceState = {
  opponent: OpponentState;
  updateOpponent: (updates: Partial<OpponentState>) => void;
};

export const createOpponentSlice: StateCreator<GameStore, [['zustand/immer', never]], [], OpponentSliceState> = (set) => ({
  opponent: {
    name: 'Susie Lee',
    party: 'Democrat',
    cash_on_hand: 500000,
    total_spent: 0,
    approval_rating: 48,
    attack_mode: false,
    endorsements_secured: ['Culinary Workers Union', 'Nevada State Education Association', 'League of Conservation Voters', 'Emily\'s List'],
    staff_level: 4,
    ad_spending: 30000,
    gotv_investment: 0,
    strategy: 'establishment',
  },

  updateOpponent: (updates) =>
    set((state) => {
      Object.assign(state.opponent, updates);
    }),
});
