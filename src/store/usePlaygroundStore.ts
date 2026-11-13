import { create } from 'zustand';
import type { Step } from '../engine/types';

type State = {
  steps: Step[];
  pseudocode: readonly string[];
  capacity: number;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
};

type Actions = {
  loadSteps: (steps: Step[], pseudocode: readonly string[]) => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setCapacity: (capacity: number) => void;
};

export const usePlaygroundStore = create<State & Actions>((set, get) => ({
  steps: [],
  pseudocode: [],
  capacity: 8,
  currentStep: 0,
  isPlaying: false,
  speed: 1,

  loadSteps: (steps, pseudocode) => set({ steps, pseudocode, currentStep: 0, isPlaying: false }),

  next: () => {
    const { currentStep, steps } = get();
    if (currentStep >= steps.length - 1) {
      set({ isPlaying: false });
      return;
    }
    const next = currentStep + 1;
    set({ currentStep: next, isPlaying: next < steps.length - 1 ? get().isPlaying : false });
  },

  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },

  goTo: (index) => {
    const { steps } = get();
    const clamped = Math.max(0, Math.min(index, steps.length - 1));
    set({ currentStep: clamped });
  },

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  setSpeed: (speed) => set({ speed }),

  setCapacity: (capacity) => set({ capacity }),
}));
