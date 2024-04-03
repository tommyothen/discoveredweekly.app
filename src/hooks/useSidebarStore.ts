import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SidebarState = {
  width: number;
  setWidth: (width: number) => void;
  getWidth: () => number;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      width: 300,
      setWidth: (width) => set({ width }),
      getWidth: () => get().width,
    }),
    {
      name: "sidebar",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
