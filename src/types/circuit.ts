export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage-source'
  | 'current-source'
  | 'ground';

export interface Terminal {
  id: string;
  componentId: string;
  name: string; // 'p' for positive, 'n' for negative, 'a'/'b' for two-terminal
  x: number; // absolute canvas position
  y: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  label: string;
  value: number; // Ohms, Farads, Henries, Volts, Amps
  x: number; // canvas position (center)
  y: number;
  rotation: number; // degrees: 0, 90, 180, 270
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  from: { componentId: string; terminalId: string };
  to: { componentId: string; terminalId: string };
  points: number[]; // [x1,y1, x2,y2, ...]
}

export interface Circuit {
  components: Component[];
  wires: Wire[];
}

export interface NodeVoltage {
  nodeId: string;
  voltage: number;
}

export interface BranchCurrent {
  componentId: string;
  current: number;
}

export interface ComponentPower {
  componentId: string;
  power: number;
}

export type SimulationResult =
  | {
      ok: true;
      nodeVoltages: NodeVoltage[];
      branchCurrents: BranchCurrent[];
      componentPower: ComponentPower[];
    }
  | {
      ok: false;
      error: SimulationError;
    };

export type SimulationError =
  | { code: 'NO_GROUND'; message: string }
  | { code: 'SHORT_CIRCUIT'; message: string }
  | { code: 'FLOATING_NODE'; message: string }
  | { code: 'SINGULAR_MATRIX'; message: string }
  | { code: 'EMPTY_CIRCUIT'; message: string };

export interface LessonStep {
  id: string;
  type: 'instruction' | 'quiz' | 'simulation';
  title: string;
  content: string;
  question?: string;
  answer?: string | number;
  tolerance?: number; // for numeric answers
  hint?: string;
  prebuiltCircuit?: Circuit;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  tags: string[];
  steps: LessonStep[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetCircuit?: Circuit;
  goals: string[];
}

export interface StudentProgressRecord {
  lessonId: string;
  completedAt: string; // ISO date
  score: number; // 0-100
  attempts: number;
}

export type CanvasAction =
  | { type: 'ADD_COMPONENT'; component: Component }
  | { type: 'REMOVE_COMPONENT'; component: Component; wires: Wire[] }
  | { type: 'MOVE_COMPONENT'; componentId: string; from: { x: number; y: number }; to: { x: number; y: number } }
  | { type: 'ROTATE_COMPONENT'; componentId: string; from: number; to: number }
  | { type: 'UPDATE_VALUE'; componentId: string; from: number; to: number }
  | { type: 'ADD_WIRE'; wire: Wire }
  | { type: 'REMOVE_WIRE'; wire: Wire }
  | { type: 'CLEAR_ALL'; circuit: Circuit };
