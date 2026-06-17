import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BuilderItem {
  id: string;
  name: string;
  category: string;
  region: string;
  price: number;
  emoji: string;
  description?: string;
  lat?: number;
  lng?: number;
}

interface BuilderState {
  items: BuilderItem[];
  showCompare: boolean;
  myRoute: BuilderItem[];
  addItem: (item: BuilderItem) => void;
  removeItem: (id: string) => void;
  reorderItems: (fromIndex: number, toIndex: number) => void;
  setRoute: (items: BuilderItem[]) => void;
  clearItems: () => void;
  toggleCompare: () => void;
  totalCost: () => number;
  nights: () => number;
  days: () => number;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      items: [],
      showCompare: false,
      myRoute: [],
      addItem: (item) =>
        set((s) => {
          if (s.myRoute.find((i: BuilderItem) => i.id === item.id)) return s;
          return { myRoute: [...s.myRoute, item] };
        }),
      removeItem: (id) =>
        set((s) => ({ myRoute: s.myRoute.filter((i: BuilderItem) => i.id !== id) })),
      reorderItems: (fromIndex, toIndex) =>
        set((s) => {
          const newRoute = [...s.myRoute];
          const [moved] = newRoute.splice(fromIndex, 1);
          newRoute.splice(toIndex, 0, moved);
          return { myRoute: newRoute };
        }),
      setRoute: (items) => set({ myRoute: items }),
      clearItems: () => set({ myRoute: [] }),
      toggleCompare: () => set((s) => ({ showCompare: !s.showCompare })),
      totalCost: () => {
        const s = get();
        return s.myRoute.reduce((sum: number, i: BuilderItem) => sum + i.price, 0);
      },
      nights: () => {
        const s = get();
        return s.myRoute.filter((i: BuilderItem) => i.category === "Жильё").length;
      },
      days: () => {
        const s = get();
        return Math.max(1, Math.ceil(s.myRoute.filter((i: BuilderItem) => i.category !== "Транспорт").length / 3));
      },
    }),
    { name: "nomadtrip-route" }
  )
);
