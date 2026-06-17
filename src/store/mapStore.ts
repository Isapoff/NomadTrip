import { create } from "zustand";

interface MapState {
  activeRoute: string | null;
  customRoute: boolean;
  flyTo: [number, number] | null;
  zoom: number;
  setActiveRoute: (id: string | null) => void;
  setCustomRoute: (v: boolean) => void;
  setFlyTo: (coords: [number, number] | null, zoom?: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  activeRoute: null,
  customRoute: false,
  flyTo: null,
  zoom: 9,
  setActiveRoute: (id) => set({ activeRoute: id }),
  setCustomRoute: (v) => set({ customRoute: v }),
  setFlyTo: (coords, zoom = 9) => set({ flyTo: coords, zoom }),
}));
