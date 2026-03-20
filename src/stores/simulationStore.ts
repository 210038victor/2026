import { create } from 'zustand';
import type { Circuit, SimulationResult } from '../types/circuit';
import { solveCircuit } from '../solver/mna';

interface SimulationState {
  result: SimulationResult | null;
  isRunning: boolean;
  runSimulation: (circuit: Circuit) => void;
  clearResult: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  result: null,
  isRunning: false,

  runSimulation: (circuit) => {
    set({ isRunning: true });
    // Simulate async to allow UI update
    setTimeout(() => {
      const result = solveCircuit(circuit);
      set({ result, isRunning: false });
    }, 50);
  },

  clearResult: () => set({ result: null }),
}));
