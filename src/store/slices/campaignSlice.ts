import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';
import type { AllocatedAction, AdAllocation } from '@/types/actions.ts';
import type { StaffRole, AdCampaign, ActionType, StaffMember, Endorsement, CampaignFinances } from '@/types/game.ts';

export type CampaignSliceState = {
  finances: CampaignFinances;
  staff: StaffMember[];
  endorsements: Endorsement[];
  ads: AdCampaign[];
  momentum: number;
  gotv_investment: number;
  actions_taken: ActionType[];
  allocateAction: (action: AllocatedAction) => void;
  setAds: (ads: AdAllocation[]) => void;
  hireStaff: (role: StaffRole) => void;
  pursueEndorsement: (id: string) => void;
};

export const createCampaignSlice: StateCreator<GameStore, [['zustand/immer', never]], [], CampaignSliceState> = (set) => ({
  finances: {
    cash_on_hand: 200000,
    total_raised: 200000,
    total_spent: 0,
    small_donors: 0,
    large_donors: 0,
    pac_money: 0,
    online_income_rate: 2000,
    email_list_size: 1000,
    weekly_burn_rate: 0,
    fundraising_history: [],
  },
  staff: [],
  endorsements: [],
  ads: [],
  momentum: 0,
  gotv_investment: 0,
  actions_taken: [],

  allocateAction: (action) =>
    set((state) => {
      if (state.actions_remaining >= action.intensity) {
        state.actions_taken.push(action.type);
        state.actions_remaining -= action.intensity;
      }
    }),

  setAds: (ads) =>
    set((state) => {
      state.ads = ads.map((a) => ({
        medium: a.medium,
        tone: a.tone,
        budget: a.budget,
        target_demographic: a.target,
      }));
    }),

  hireStaff: (role) =>
    set((state) => {
      const staffMember = state.staff.find((s) => s.role === role && !s.hired);
      if (staffMember) {
        staffMember.hired = true;
      }
    }),

  pursueEndorsement: (id) =>
    set((state) => {
      const endorsement = state.endorsements.find((e) => e.id === id);
      if (endorsement && !endorsement.secured && !endorsement.pursued) {
        endorsement.pursued = true;
      }
    }),
});
