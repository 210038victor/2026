import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Circuit, Component, ComponentType, Wire } from '../types/circuit'

const MAX_COMPONENTS = 50

function createTerminals(type: ComponentType, componentId: string) {
  switch (type) {
    case 'ground':
      return [{ id: `${componentId}-gnd`, name: 'gnd' as const, offset: { x: 0, y: 20 } }]
    case 'resistor':
    case 'capacitor':
    case 'inductor':
      return [
        { id: `${componentId}-positive`, name: 'positive' as const, offset: { x: -30, y: 0 } },
        { id: `${componentId}-negative`, name: 'negative' as const, offset: { x: 30, y: 0 } },
      ]
    case 'voltage-source':
    case 'current-source':
      return [
        { id: `${componentId}-positive`, name: 'positive' as const, offset: { x: 0, y: -30 } },
        { id: `${componentId}-negative`, name: 'negative' as const, offset: { x: 0, y: 30 } },
      ]
    default:
      return []
  }
}

function getDefaultUnit(type: ComponentType): string {
  switch (type) {
    case 'resistor': return 'Ω'
    case 'capacitor': return 'F'
    case 'inductor': return 'H'
    case 'voltage-source': return 'V'
    case 'current-source': return 'A'
    default: return ''
  }
}

function createEmptyCircuit(): Circuit {
  return {
    id: nanoid(),
    name: 'Workspace',
    components: [],
    wires: [],
    scope: 'workspace',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

interface CircuitState {
  circuit: Circuit
  selectedIds: string[]
  addComponent: (type: ComponentType, position: { x: number; y: number }) => void
  removeComponent: (id: string) => void
  moveComponent: (id: string, position: { x: number; y: number }) => void
  rotateComponent: (id: string) => void
  updateComponentValue: (id: string, value: number) => void
  addWire: (fromTerminalId: string, toTerminalId: string) => void
  removeWire: (id: string) => void
  setSelected: (ids: string[]) => void
  clearAll: () => void
  reset: () => void
  removeSelected: () => void
  loadCircuit: (circuit: Circuit) => void
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: createEmptyCircuit(),
  selectedIds: [],

  addComponent(type, position) {
    const { circuit } = get()
    if (circuit.components.length >= MAX_COMPONENTS) return
    const id = nanoid()
    const component: Component = {
      id,
      type,
      value: type === 'ground' ? 0 : 1,
      unit: getDefaultUnit(type),
      position,
      rotation: 0,
      terminals: createTerminals(type, id),
    }
    set({
      circuit: {
        ...circuit,
        components: [...circuit.components, component],
        updatedAt: Date.now(),
      },
    })
  },

  removeComponent(id) {
    const { circuit } = get()
    const terminalIds = new Set(
      circuit.components.find((c) => c.id === id)?.terminals.map((t) => t.id) ?? []
    )
    set({
      circuit: {
        ...circuit,
        components: circuit.components.filter((c) => c.id !== id),
        wires: circuit.wires.filter(
          (w) => !terminalIds.has(w.fromTerminalId) && !terminalIds.has(w.toTerminalId)
        ),
        updatedAt: Date.now(),
      },
      selectedIds: get().selectedIds.filter((sid) => sid !== id),
    })
  },

  moveComponent(id, position) {
    const { circuit } = get()
    set({
      circuit: {
        ...circuit,
        components: circuit.components.map((c) => (c.id === id ? { ...c, position } : c)),
        updatedAt: Date.now(),
      },
    })
  },

  rotateComponent(id) {
    const { circuit } = get()
    const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270]
    set({
      circuit: {
        ...circuit,
        components: circuit.components.map((c) => {
          if (c.id !== id) return c
          const idx = rotations.indexOf(c.rotation)
          return { ...c, rotation: rotations[(idx + 1) % 4] }
        }),
        updatedAt: Date.now(),
      },
    })
  },

  updateComponentValue(id, value) {
    if (value <= 0) return
    const { circuit } = get()
    set({
      circuit: {
        ...circuit,
        components: circuit.components.map((c) => (c.id === id ? { ...c, value } : c)),
        updatedAt: Date.now(),
      },
    })
  },

  addWire(fromTerminalId, toTerminalId) {
    if (fromTerminalId === toTerminalId) return
    const { circuit } = get()
    const duplicate = circuit.wires.some(
      (w) =>
        (w.fromTerminalId === fromTerminalId && w.toTerminalId === toTerminalId) ||
        (w.fromTerminalId === toTerminalId && w.toTerminalId === fromTerminalId)
    )
    if (duplicate) return
    const wire: Wire = { id: nanoid(), fromTerminalId, toTerminalId }
    set({
      circuit: {
        ...circuit,
        wires: [...circuit.wires, wire],
        updatedAt: Date.now(),
      },
    })
  },

  removeWire(id) {
    const { circuit } = get()
    set({
      circuit: {
        ...circuit,
        wires: circuit.wires.filter((w) => w.id !== id),
        updatedAt: Date.now(),
      },
    })
  },

  setSelected(ids) {
    set({ selectedIds: ids })
  },

  clearAll() {
    set({ circuit: createEmptyCircuit(), selectedIds: [] })
  },

  reset() {
    set({ circuit: createEmptyCircuit(), selectedIds: [] })
  },

  removeSelected() {
    const { circuit, selectedIds } = get()
    const selectedSet = new Set(selectedIds)
    const removedTerminalIds = new Set(
      circuit.components
        .filter((c) => selectedSet.has(c.id))
        .flatMap((c) => c.terminals.map((t) => t.id))
    )
    set({
      circuit: {
        ...circuit,
        components: circuit.components.filter((c) => !selectedSet.has(c.id)),
        wires: circuit.wires.filter(
          (w) =>
            !selectedSet.has(w.id) &&
            !removedTerminalIds.has(w.fromTerminalId) &&
            !removedTerminalIds.has(w.toTerminalId)
        ),
        updatedAt: Date.now(),
      },
      selectedIds: [],
    })
  },

  loadCircuit(circuit) {
    set({ circuit, selectedIds: [] })
  },
}))
