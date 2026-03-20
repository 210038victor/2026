import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Circuit, Component, Wire, ComponentType, Terminal } from '../types/circuit';

const GRID_SIZE = 40;
const snap = (v: number) => Math.round(v / GRID_SIZE) * GRID_SIZE;

function makeTerminals(type: ComponentType, x: number, y: number, rotation: number): Terminal[] {
  const baseTerminals = getBaseTerminalOffsets(type);
  return baseTerminals.map((offset) => {
    const rad = (rotation * Math.PI) / 180;
    const rx = offset.dx * Math.cos(rad) - offset.dy * Math.sin(rad);
    const ry = offset.dx * Math.sin(rad) + offset.dy * Math.cos(rad);
    return {
      id: nanoid(),
      componentId: '', // filled in after
      name: offset.name,
      x: x + rx,
      y: y + ry,
    };
  });
}

function getBaseTerminalOffsets(type: ComponentType): Array<{ dx: number; dy: number; name: string }> {
  switch (type) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
      return [
        { dx: -GRID_SIZE, dy: 0, name: 'a' },
        { dx: GRID_SIZE, dy: 0, name: 'b' },
      ];
    case 'voltage-source':
    case 'current-source':
      return [
        { dx: 0, dy: -GRID_SIZE, name: 'p' },
        { dx: 0, dy: GRID_SIZE, name: 'n' },
      ];
    case 'ground':
      return [{ dx: 0, dy: 0, name: 'g' }];
    default:
      return [];
  }
}

function defaultValue(type: ComponentType): number {
  switch (type) {
    case 'resistor': return 1000;
    case 'capacitor': return 1e-6;
    case 'inductor': return 1e-3;
    case 'voltage-source': return 5;
    case 'current-source': return 0.001;
    default: return 0;
  }
}

function defaultLabel(type: ComponentType, count: number): string {
  switch (type) {
    case 'resistor': return `R${count}`;
    case 'capacitor': return `C${count}`;
    case 'inductor': return `L${count}`;
    case 'voltage-source': return `V${count}`;
    case 'current-source': return `I${count}`;
    case 'ground': return 'GND';
    default: return `X${count}`;
  }
}

interface CircuitState {
  circuit: Circuit;
  selectedIds: string[];
  componentCounts: Record<string, number>;
  addComponent: (type: ComponentType, x?: number, y?: number) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  rotateComponent: (id: string) => void;
  updateComponentValue: (id: string, value: number) => void;
  addWire: (wire: Omit<Wire, 'id'>) => void;
  removeWire: (id: string) => void;
  setSelected: (ids: string[]) => void;
  clearAll: () => void;
  loadCircuit: (circuit: Circuit) => void;
}

export const useCircuitStore = create<CircuitState>((set, get) => ({
  circuit: { components: [], wires: [] },
  selectedIds: [],
  componentCounts: {},

  addComponent: (type, x = 200, y = 200) => {
    const { componentCounts } = get();
    const count = (componentCounts[type] ?? 0) + 1;
    const sx = snap(x);
    const sy = snap(y);
    const id = nanoid();
    const terminals = makeTerminals(type, sx, sy, 0).map(t => ({ ...t, componentId: id }));
    const comp: Component = {
      id,
      type,
      label: defaultLabel(type, count),
      value: defaultValue(type),
      x: sx,
      y: sy,
      rotation: 0,
      terminals,
    };
    set(state => ({
      circuit: {
        ...state.circuit,
        components: [...state.circuit.components, comp],
      },
      componentCounts: { ...componentCounts, [type]: count },
    }));
  },

  removeComponent: (id) => {
    set(state => ({
      circuit: {
        components: state.circuit.components.filter(c => c.id !== id),
        wires: state.circuit.wires.filter(
          w => w.from.componentId !== id && w.to.componentId !== id
        ),
      },
      selectedIds: state.selectedIds.filter(sid => sid !== id),
    }));
  },

  moveComponent: (id, x, y) => {
    const sx = snap(x);
    const sy = snap(y);
    set(state => ({
      circuit: {
        ...state.circuit,
        components: state.circuit.components.map(c => {
          if (c.id !== id) return c;
          const dx = sx - c.x;
          const dy = sy - c.y;
          return {
            ...c,
            x: sx,
            y: sy,
            terminals: c.terminals.map(t => ({ ...t, x: t.x + dx, y: t.y + dy })),
          };
        }),
      },
    }));
  },

  rotateComponent: (id) => {
    set(state => ({
      circuit: {
        ...state.circuit,
        components: state.circuit.components.map(c => {
          if (c.id !== id) return c;
          const newRotation = (c.rotation + 90) % 360;
          const terminals = makeTerminals(c.type, c.x, c.y, newRotation).map((t, i) => ({
            ...t,
            id: c.terminals[i]?.id ?? nanoid(),
            componentId: c.id,
          }));
          return { ...c, rotation: newRotation, terminals };
        }),
      },
    }));
  },

  updateComponentValue: (id, value) => {
    set(state => ({
      circuit: {
        ...state.circuit,
        components: state.circuit.components.map(c =>
          c.id === id ? { ...c, value } : c
        ),
      },
    }));
  },

  addWire: (wire) => {
    const newWire: Wire = { ...wire, id: nanoid() };
    set(state => ({
      circuit: {
        ...state.circuit,
        wires: [...state.circuit.wires, newWire],
      },
    }));
  },

  removeWire: (id) => {
    set(state => ({
      circuit: {
        ...state.circuit,
        wires: state.circuit.wires.filter(w => w.id !== id),
      },
    }));
  },

  setSelected: (ids) => set({ selectedIds: ids }),

  clearAll: () => set({ circuit: { components: [], wires: [] }, selectedIds: [], componentCounts: {} }),

  loadCircuit: (circuit) => set({ circuit, selectedIds: [] }),
}));
