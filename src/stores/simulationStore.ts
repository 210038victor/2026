import { create } from 'zustand'
import type { Circuit, SimulationResult } from '../types/circuit'

interface SimulationState {
  result: SimulationResult | null
  isStale: boolean
  solve: (circuit: Circuit) => void
  markStale: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  result: null,
  isStale: false,

  solve(circuit) {
    if (circuit.components.length === 0) {
      set({
        result: {
          circuitId: circuit.id,
          status: 'error',
          error: {
            type: 'floating-node',
            message: '電路為空，請新增元件。',
          },
          nodeVoltages: {},
          branchCurrents: {},
          componentPower: {},
          solvedAt: Date.now(),
        },
        isStale: false,
      })
      return
    }

    if (circuit.components.length > 50) {
      set({
        result: {
          circuitId: circuit.id,
          status: 'error',
          error: {
            type: 'component-limit',
            message: '元件數量超過上限（50個）。',
          },
          nodeVoltages: {},
          branchCurrents: {},
          componentPower: {},
          solvedAt: Date.now(),
        },
        isStale: false,
      })
      return
    }

    set({
      result: {
        circuitId: circuit.id,
        status: 'ok',
        nodeVoltages: {},
        branchCurrents: {},
        componentPower: {},
        solvedAt: Date.now(),
      },
      isStale: false,
    })
  },

  markStale() {
    set({ isStale: true })
  },
}))
