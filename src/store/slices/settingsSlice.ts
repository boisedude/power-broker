import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';

export type SettingsSliceState = {
  sound_enabled: boolean;
  animations_enabled: boolean;
  auto_save: boolean;
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleAutoSave: () => void;
};

export const createSettingsSlice: StateCreator<GameStore, [['zustand/immer', never]], [], SettingsSliceState> = (set) => ({
  sound_enabled: true,
  animations_enabled: true,
  auto_save: true,

  toggleSound: () =>
    set((state) => {
      state.sound_enabled = !state.sound_enabled;
    }),

  toggleAnimations: () =>
    set((state) => {
      state.animations_enabled = !state.animations_enabled;
    }),

  toggleAutoSave: () =>
    set((state) => {
      state.auto_save = !state.auto_save;
    }),
});
