import { create } from "zustand";

export const useAstraStore = create((set) => ({
  isAstraOpen: false,

  openAstra: () => set({ isAstraOpen: true }),

  closeAstra: () => set({ isAstraOpen: false }),
}));
