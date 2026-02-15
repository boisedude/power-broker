import type { StateCreator } from 'zustand';
import type { GameStore } from '@/types/store.ts';

export type UISliceState = {
  screen: string;
  modal_open: boolean;
  modal_content: string | null;
  notifications: { id: string; type: string; message: string }[];
  setScreen: (screen: string) => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  addNotification: (notification: UISliceState['notifications'][0]) => void;
  clearNotifications: () => void;
};

export const createUISlice: StateCreator<GameStore, [['zustand/immer', never]], [], UISliceState> = (set) => ({
  screen: 'menu',
  modal_open: false,
  modal_content: null,
  notifications: [],

  setScreen: (screen) =>
    set((state) => {
      state.screen = screen;
    }),

  openModal: (content) =>
    set((state) => {
      state.modal_open = true;
      state.modal_content = content;
    }),

  closeModal: () =>
    set((state) => {
      state.modal_open = false;
      state.modal_content = null;
    }),

  addNotification: (notification) =>
    set((state) => {
      state.notifications.push(notification);
    }),

  clearNotifications: () =>
    set((state) => {
      state.notifications = [];
    }),
});
