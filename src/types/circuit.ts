export type ComponentType =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'voltage-source'
  | 'current-source'
  | 'ground'

export type LessonTopic =
  | 'ohms-law'
  | 'kvl'
  | 'kcl'
  | 'series-circuit'
  | 'parallel-circuit'
  | 'thevenin'
  | 'norton'
  | 'nodal-analysis'
  | 'mesh-analysis'
  | 'superposition'

export type StepType =
  | 'label-node'
  | 'enter-equation'
  | 'enter-value'
  | 'place-component'
  | 'connect-wire'
  | 'identify-element'

export interface Terminal {
  id: string
  name: 'positive' | 'negative' | 'anode' | 'cathode' | 'gnd'
  offset: { x: number; y: number }
}

export interface Component {
  id: string
  type: ComponentType
  value: number
  unit: string
  position: { x: number; y: number }
  rotation: 0 | 90 | 180 | 270
  label?: string
  terminals: Terminal[]
}

export interface Wire {
  id: string
  fromTerminalId: string
  toTerminalId: string
  waypoints?: { x: number; y: number }[]
}

export interface Circuit {
  id: string
  name: string
  components: Component[]
  wires: Wire[]
  scope: 'workspace' | 'lesson' | 'exercise'
  ownerId?: string
  createdAt: number
  updatedAt: number
}

export interface SimulationError {
  type: 'short-circuit' | 'floating-node' | 'singular-matrix' | 'component-limit'
  message: string
  affectedIds?: string[]
}

export interface SimulationResult {
  circuitId: string
  status: 'ok' | 'error'
  error?: SimulationError
  nodeVoltages: Record<string, number>
  branchCurrents: Record<string, number>
  componentPower: Record<string, number>
  solvedAt: number
}

export interface LessonStep {
  id: string
  order: number
  instruction: string
  type: StepType
  expectedAnswer: string | number
  tolerance?: number
  hint: string
  explanation: string
  prebuiltCircuit?: Circuit
}

export interface Lesson {
  id: string
  title: string
  topic: LessonTopic
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedMinutes: number
  prerequisiteIds: string[]
  steps: LessonStep[]
}

export interface Exercise {
  id: string
  title: string
  topic: LessonTopic
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questionText: string
  circuit: Circuit
  correctAnswer: number
  answerUnit: string
  tolerancePercent: number
  maxAttempts: number
  solutionWalkthrough: string[]
}

export interface StudentProgressRecord {
  id: string
  studentId: string
  type: 'lesson' | 'exercise'
  targetId: string
  status: 'not-started' | 'in-progress' | 'completed'
  score?: number
  completedSteps?: number[]
  attemptCount?: number
  startedAt?: number
  completedAt?: number
  lastUpdatedAt: number
}

export interface CanvasAction {
  type:
    | 'add-component'
    | 'remove-component'
    | 'move-component'
    | 'rotate-component'
    | 'change-value'
    | 'add-wire'
    | 'remove-wire'
  payload: unknown
  timestamp: number
}

export interface StepFeedback {
  isCorrect: boolean
  isPartiallyCorrect: boolean
  message: string
  hint?: string
}
