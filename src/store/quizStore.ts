import { create } from "zustand";

interface QuizPrefs {
  goal: string;
  budgetDay: number;
  days: number;
  season: string;
  group: string;
  fitness: number;
  regions: string[];
  wNature: number;
  wCulture: number;
  wComfort: number;
  wCost: number;
  wAdventure: number;
}

interface QuizState {
  prefs: QuizPrefs;
  step: number;
  results: any | null;
  recommending: boolean;
  setPref: <K extends keyof QuizPrefs>(key: K, value: QuizPrefs[K]) => void;
  setStep: (step: number) => void;
  setResults: (results: any) => void;
  setRecommending: (v: boolean) => void;
  reset: () => void;
}

const defaultPrefs: QuizPrefs = {
  goal: "Природа",
  budgetDay: 5000,
  days: 7,
  season: "Лето",
  group: "Соло",
  fitness: 3,
  regions: ["Иссык-Куль", "Бишкек", "Нарын", "Ош", "Жалал-Абад", "Талас", "Баткен"],
  wNature: 3,
  wCulture: 3,
  wComfort: 3,
  wCost: 3,
  wAdventure: 3,
};

export const useQuizStore = create<QuizState>((set) => ({
  prefs: { ...defaultPrefs },
  step: 1,
  results: null,
  recommending: false,
  setPref: (key, value) =>
    set((s) => ({ prefs: { ...s.prefs, [key]: value } })),
  setStep: (step) => set({ step }),
  setResults: (results) => set({ results }),
  setRecommending: (v) => set({ recommending: v }),
  reset: () => set({ prefs: { ...defaultPrefs }, step: 1, results: null, recommending: false }),
}));
