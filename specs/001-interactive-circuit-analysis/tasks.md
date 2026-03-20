# Tasks: 響應式互動學習電路分析 (Responsive Interactive Learning Circuit Analysis)

**Input**: Design documents from `/specs/001-interactive-circuit-analysis/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included per Constitution Principle V (TDD) — confirmed required in plan.md (Constitution compliance row V).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All tasks include exact file paths

## Path Conventions

Single-project SPA: `src/`, `tests/` at repository root.  
Deployment target: GitHub Pages (`/2026/` base path).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite + React + TypeScript project, install all dependencies, and configure tooling. Must complete before any implementation work.

- [ ] T001 Initialise Vite + React + TypeScript project at repo root via `npm create vite@latest . -- --template react-ts`, backup `/specs` and `.specify` first per Constitution VII, then run `npm install konva react-konva zustand numeric` and `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @playwright/test`
- [ ] T002 [P] Create all source and test directories per plan.md: `src/components/{canvas,toolbar,simulation,lessons,exercises,dashboard}`, `src/{solver,stores,data/{lessons,exercises},utils,hooks,types}`, `tests/{unit/{solver,utils},component,e2e}`
- [ ] T003 [P] Configure `vite.config.ts` with `base: '/2026/'`, `@/` path alias pointing to `src/`, and inline Vitest config (`test.environment: 'jsdom'`, `test.globals: true`, `test.setupFiles: ['@testing-library/jest-dom']`)
- [ ] T004 [P] Configure `tsconfig.json` (and `tsconfig.app.json`) with `paths: { "@/*": ["src/*"] }` compilerOption to support `@/` alias throughout the codebase
- [ ] T005 [P] Create `playwright.config.ts` at repo root: configure `baseURL: 'http://localhost:5173'`, three projects (chromium, firefox, webkit), mobile viewport preset (375 × 667), and `webServer` auto-start block

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared types and utilities that every user story depends on. No user story phase can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Define all shared TypeScript interfaces and types in `src/types/circuit.ts`: `Component`, `ComponentType`, `Terminal`, `Wire`, `Circuit`, `SimulationResult`, `SimulationError`, `Lesson`, `LessonTopic`, `LessonStep`, `StepType`, `Exercise`, `StudentProgressRecord`, `CircuitState`, `SimulationState`, `HistoryState`, `CanvasAction`, `LessonState`, `StepFeedback`, `ProgressState` — exact shapes from data-model.md
- [ ] T007 [P] Implement `src/utils/persistence.ts`: `loadFromStorage<T>(key: string): T | null` and `saveToStorage<T>(key: string, value: T): void` with JSON parse/stringify, try-catch guards, and merge-before-write safety per progress-store contract
- [ ] T008 [P] Implement `src/utils/siFormat.ts`: export `formatSI(value: number, unit: string): string` supporting all SI prefixes T, G, M, k, (none), m, µ, n, p (FR-015); handle zero, negative, and boundary values defensively
- [ ] T009 [P] Implement `src/utils/connectivity.ts`: export `buildNodeMap(circuit: Circuit): Map<string, string>` that assigns a `nodeId` to each terminal via union-find over wires, and `isConnected(circuit: Circuit): boolean`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Build and Simulate a Circuit (Priority: P1) 🎯 MVP

**Goal**: Student opens canvas, places components (resistor, voltage source, ground), connects them with wires, and sees node voltages, branch currents, and component power update in real time (≤1 s). Drag-drop, rotate, delete, undo/redo (20 steps), and touch support all work.

**Independent Test**: Open the app, place a 10 Ω resistor + 5 V voltage source + ground, connect them, and verify current = 0.5 A and power = 2.5 W displayed without any manual step.

### Tests for User Story 1 (TDD — write and confirm RED before implementation)

- [ ] T010 [P] [US1] Write MNA solver unit tests in `tests/unit/solver/mna.test.ts`: cover empty circuit → ok, 5V+10Ω → 0.5A/2.5W, short circuit → error type 'short-circuit', floating node → 'floating-node', >50 components → 'component-limit', no NaN/Infinity in outputs
- [ ] T011 [P] [US1] Write topology analysis unit tests in `tests/unit/solver/topology.test.ts`: cover `getConnectedNodes` for series/parallel circuits, isolated terminals, and multi-branch loops; cover `detectShortCircuit` for zero-resistance loop detection
- [ ] T012 [P] [US1] Write SI format unit tests in `tests/unit/utils/siFormat.test.ts`: cover formatSI(0.5, 'A') → '500 mA', formatSI(4700, 'Ω') → '4.7 kΩ', formatSI(1e-6, 'F') → '1 µF', formatSI(0, 'V') → '0 V', all 9 prefix tiers
- [ ] T013 [US1] Write CircuitCanvas component tests in `tests/component/CircuitCanvas.test.tsx`: render empty canvas, add component via palette click, verify component appears; simulate undo/redo via keyboard shortcut; verify error banner appears on simulated short-circuit result
- [ ] T014 [US1] Write US1 E2E test in `tests/e2e/us1-simulate-circuit.spec.ts`: AC1 — place resistor + voltage source + ground, connect wires, assert simulation panel shows 0.5 A; AC2 — change resistor value, assert values update within 1 s; AC3 — mobile viewport 375×667, assert no horizontal scroll and all controls reachable by touch

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement `src/solver/mna.ts`: export `solveCircuit(circuit: Circuit): SimulationResult`, `detectShortCircuit(circuit: Circuit): string[]`, `getConnectedNodes(circuit: Circuit): Map<string, string>`; use numeric.js `numeric.solve()` for matrix; handle singular matrix (|det| < 1e-12), floating node, and component-limit cases; never return NaN or Infinity
- [ ] T016 [P] [US1] Implement `src/solver/topology.ts`: export `buildAdjacency(circuit: Circuit)`, `findConnectedComponents(circuit: Circuit)`, and `hasShortCircuitLoop(circuit: Circuit): boolean` using BFS/DFS over the wire graph
- [ ] T017 [P] [US1] Implement `src/solver/simplify.ts`: export `simplifySeriesResistors(circuit: Circuit): Circuit` and `simplifyParallelResistors(circuit: Circuit): Circuit` for series/parallel DC simplification (FR-016)
- [ ] T018 [US1] Implement `src/stores/circuitStore.ts`: Zustand store matching circuit-store.contract.md — `addComponent`, `removeComponent`, `moveComponent`, `rotateComponent`, `updateComponentValue`, `addWire`, `removeWire`, `setSelected`, `clearAll`, `reset`; enforce 50-component limit on `addComponent`; auto-remove dangling wires on `removeComponent`; update `circuit.updatedAt` on every action
- [ ] T019 [US1] Implement `src/stores/simulationStore.ts`: Zustand store with `result: SimulationResult | null`, `isStale: boolean`, `solve(circuit: Circuit): void`; call `solveCircuit()` from `src/solver/mna.ts` and set `isStale = false` after solving; set `isStale = true` when circuit changes (subscribe to circuitStore)
- [ ] T020 [US1] Implement `src/stores/historyStore.ts`: Zustand store with `past: CanvasAction[]` (max 20), `future: CanvasAction[]`, `canUndo`, `canRedo`, `execute(action)`, `undo()`, `redo()`; replay strategy — undo rebuilds state by replaying remaining past actions via circuitStore `reset()` + replay; limit past to 20 entries (FR-006)
- [ ] T021 [P] [US1] Implement `src/components/canvas/GridLayer.tsx`: Konva Layer with background dot-grid lines; accept `width` and `height` props; memoize with `React.memo`
- [ ] T022 [P] [US1] Implement `src/components/canvas/ComponentLayer.tsx`: Konva Layer rendering each `Component` as a labeled shape (Group + Rect/Line + Text); support drag (`onDragEnd` → `circuitStore.moveComponent`), click-to-select (`circuitStore.setSelected`), and rotation indicator; use SI-formatted value labels via `formatSI`
- [ ] T023 [P] [US1] Implement `src/components/canvas/WireLayer.tsx`: Konva Layer rendering each `Wire` as a polyline through optional waypoints; highlight selected wires; handle click-to-start-wire and click-terminal-to-finish-wire interactions calling `circuitStore.addWire`
- [ ] T024 [P] [US1] Implement `src/components/canvas/SelectionOverlay.tsx`: Konva Layer rendering a dashed selection rectangle around selected component bounds; support rubber-band multi-select via mouse drag
- [ ] T025 [US1] Implement `src/components/canvas/CircuitCanvas.tsx`: main Konva Stage composing `GridLayer`, `WireLayer`, `ComponentLayer`, and `SelectionOverlay`; subscribe to `circuitStore` and `simulationStore`; display `SimulationError` banner overlay when `result.status === 'error'` (FR-004); trigger `simulationStore.solve()` on each circuit change; support touch pan/zoom via Konva `Stage` touch events (FR-014)
- [ ] T026 [P] [US1] Implement `src/components/toolbar/ComponentPalette.tsx`: palette of draggable component buttons (resistor, capacitor, inductor, voltage-source, current-source, ground); on drop onto canvas call `circuitStore.addComponent` at drop coordinates; display component name and symbol; touch-tap-to-place fallback for mobile (FR-014)
- [ ] T027 [P] [US1] Implement `src/components/toolbar/ActionBar.tsx`: undo button (disabled when `!canUndo`), redo button (disabled when `!canRedo`), clear-all button with confirmation; subscribe to `historyStore.canUndo` and `historyStore.canRedo`
- [ ] T028 [P] [US1] Implement `src/components/simulation/NodeVoltageDisplay.tsx`: overlay labels on each circuit node showing voltage in SI format (e.g. '3.3 V'); re-renders on `simulationStore.result` change; hidden when result is null or status is error
- [ ] T029 [US1] Implement `src/components/simulation/SimulationPanel.tsx`: sidebar panel listing branch currents and component power from `simulationStore.result`; format values with `formatSI`; show error message text when `result.status === 'error'`; show 'Stale' badge when `isStale === true`
- [ ] T030 [P] [US1] Implement `src/hooks/useKeyboardShortcuts.ts`: bind `Ctrl+Z` → `historyStore.undo()`, `Ctrl+Y` / `Ctrl+Shift+Z` → `historyStore.redo()`, `Delete`/`Backspace` → `circuitStore.removeSelected()` on `document` keydown; clean up listeners on unmount
- [ ] T031 [P] [US1] Implement `src/hooks/useResponsive.ts`: export `useBreakpoint()` returning `'mobile' | 'tablet' | 'desktop'` based on `window.innerWidth` (≤767 mobile, 768–1279 tablet, ≥1280 desktop); update on `resize` event; use in layout components for responsive adaptation (FR-013)

**Checkpoint**: User Story 1 fully functional — simulate a circuit end-to-end, undo/redo works, mobile touch works

---

## Phase 4: User Story 2 — Follow a Guided Circuit Analysis Lesson (Priority: P2)

**Goal**: Student browses the lesson catalog, opens a lesson (e.g. KVL), follows step-by-step instructions, receives immediate correct/incorrect/hint feedback per step, and their progress is persisted to localStorage so they can resume later.

**Independent Test**: Select the KVL lesson, complete all steps (submit one correct and one incorrect answer), verify feedback is shown for each, verify lesson shows completion state, close tab and reopen — verify resume from last completed step.

### Tests for User Story 2 (TDD — write and confirm RED before implementation)

- [ ] T032 [US2] Write LessonPlayer component tests in `tests/component/LessonPlayer.test.tsx`: render first step instruction; submit correct answer → `isCorrect` feedback shown; submit incorrect answer → hint shown; advance to next step; reach final step → completion indicator shown; progress persists via mock `lessonStore`
- [ ] T033 [US2] Write US2 E2E test in `tests/e2e/us2-guided-lesson.spec.ts`: AC1 — open KVL lesson, complete all steps in order, assert completion indicator; AC2 — submit incorrect answer, assert non-revealing hint appears; AC3 — partially complete lesson, reload page, assert resume from last completed step

### Implementation for User Story 2

- [ ] T034 [US2] Create 10 lesson JSON data files in `src/data/lessons/`: `ohms-law.json`, `kvl.json`, `kcl.json`, `series-circuit.json`, `parallel-circuit.json`, `thevenin.json`, `norton.json`, `nodal-analysis.json`, `mesh-analysis.json`, `superposition.json` — each with `id`, `title`, `topic`, `difficulty`, `estimatedMinutes`, `prerequisiteIds`, `steps[]` (min 2 steps each) per Lesson/LessonStep schema in data-model.md; at least the ohms-law lesson must have the exact steps from quickstart.md
- [ ] T035 [US2] Implement `src/stores/lessonStore.ts`: Zustand store with `currentLesson`, `currentStepIndex`, `feedback`, `loadLesson(lessonId)`, `submitAnswer(answer)` (compare to `expectedAnswer` within `tolerance`, set `StepFeedback`), `skipStep()`; on step completion call `progressStore.completeStep`; on lesson load call `progressStore.startLesson` and restore `currentStepIndex` from saved `completedSteps`
- [ ] T036 [P] [US2] Implement `src/components/lessons/LessonCatalog.tsx`: grid of lesson cards showing title, topic, difficulty badge, estimated time, and completion status from `progressStore`; prerequisite lock icon when `prerequisiteIds` not yet completed; navigate to lesson on click
- [ ] T037 [P] [US2] Implement `src/components/lessons/StepFeedback.tsx`: display feedback message with coloured indicator (green correct, red incorrect, amber partial); show `hint` text when `isCorrect === false`; show `explanation` text when step is completed; accessible ARIA live region for screen readers
- [ ] T038 [US2] Implement `src/components/lessons/LessonPlayer.tsx`: render current step's `instruction` and input control matching `step.type` (`enter-value` → number input, `enter-equation` → text input, `label-node` → canvas overlay, `place-component` / `connect-wire` → canvas action detection, `identify-element` → multiple choice); submit button calls `lessonStore.submitAnswer`; next-step button enabled only after correct answer or explicit skip; show `StepFeedback`; show step progress indicator (e.g. '2 / 5'); show completion screen on last step

**Checkpoint**: User Stories 1 AND 2 independently testable and functional

---

## Phase 5: User Story 3 — Review Learning History and Progress (Priority: P3)

**Goal**: Student views a dashboard showing all lessons attempted, their scores, and completion dates. An onboarding prompt guides students who have not yet started any lessons. Dashboard is fully responsive (320 px–2560 px).

**Independent Test**: Complete two lessons (can be done via browser), navigate to `/dashboard`, verify both lessons are listed with score and completion date; then clear localStorage and reload — verify onboarding prompt appears.

### Tests for User Story 3 (TDD — write and confirm RED before implementation)

- [ ] T039 [US3] Write US3 E2E test in `tests/e2e/us3-progress-dashboard.spec.ts`: AC1 — after completing two lessons, navigate to dashboard, assert both listed with score and date; AC2 — with no progress, visit dashboard, assert onboarding prompt visible and links to lesson catalog; AC3 — mobile viewport 375×667, assert all data readable without horizontal scroll

### Implementation for User Story 3

- [ ] T040 [US3] Implement `src/stores/progressStore.ts`: Zustand store matching progress-store.contract.md — `records`, `studentId`, `loadProgress(studentId)`, `startLesson(lessonId)`, `completeStep(lessonId, stepOrder)`, `recordExerciseAttempt(exerciseId, isCorrect)`, `getRecordFor(type, targetId)`; persist to localStorage using `persistence.ts` after every mutation; enforce status one-way transitions and deduplicated `completedSteps`; calculate `score` as `Math.round((completedSteps.length / lesson.steps.length) * 100)` on completion
- [ ] T041 [US3] Implement `src/components/dashboard/ProgressDashboard.tsx`: fetch all records from `progressStore`; render completed lessons table (title, score badge, completion date formatted in locale); render in-progress lessons section; show empty-state onboarding prompt with CTA to lesson catalog when `records.length === 0`; use `useResponsive` for adaptive layout (single-column mobile, two-column tablet/desktop) (FR-013)

**Checkpoint**: User Stories 1, 2, and 3 all independently testable and functional

---

## Phase 6: User Story 4 — Practice with Circuit Analysis Exercises (Priority: P4)

**Goal**: Student selects an exercise, uses the interactive canvas to work through the problem, submits an answer, receives a scored result (±2% tolerance, max 3 attempts), and sees a step-by-step solution walkthrough after exhausting attempts or answering correctly.

**Independent Test**: Open an exercise, submit the known correct answer, verify score recorded; retry same exercise with a wrong answer, verify feedback and attempt count; after 3 wrong attempts verify solution walkthrough is revealed.

### Tests for User Story 4 (TDD — write and confirm RED before implementation)

- [ ] T042 [US4] Write US4 E2E test in `tests/e2e/us4-exercise.spec.ts`: AC1 — open exercise, submit correct answer within ±2%, assert marked correct and walkthrough shown; AC2 — submit incorrect answer, assert feedback with attempt count, after 3 wrong attempts assert solution revealed; AC3 — annotate nodes on canvas during exercise, assert annotations visible throughout session

### Implementation for User Story 4

- [ ] T043 [US4] Create exercise JSON data files in `src/data/exercises/` — at least 10 files (e.g. `ex-ohms-basic.json`, `ex-series-resistance.json`, `ex-parallel-resistance.json`, `ex-kvl-loop.json`, `ex-kcl-node.json`, `ex-thevenin.json`, `ex-norton.json`, `ex-nodal.json`, `ex-mesh.json`, `ex-superposition.json`); each file must conform to the `Exercise` schema in data-model.md with `correctAnswer`, `tolerancePercent: 2`, `maxAttempts: 3`, and `solutionWalkthrough` array
- [ ] T044 [P] [US4] Implement `src/components/exercises/ExerciseList.tsx`: grid of exercise cards showing title, topic, difficulty, and attempt history from `progressStore`; filter/sort by topic and difficulty; navigate to exercise on click
- [ ] T045 [US4] Implement `src/components/exercises/ExercisePlayer.tsx`: render exercise question text and read-only `CircuitCanvas` (circuit from `exercise.circuit`, topology locked); number input for answer submission; evaluate answer within `tolerancePercent` tolerance (FR-012 AC1); decrement remaining attempts and show feedback on incorrect submission; after `maxAttempts` exhausted OR correct answer, reveal `solutionWalkthrough` step-by-step (FR-012 AC2); call `progressStore.recordExerciseAttempt` on each submit; support canvas node annotation overlay that persists for the session duration (FR-012 AC3)

**Checkpoint**: All four user stories independently testable and functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: App shell wiring, deployment, and hardening for edge cases and responsiveness across all stories.

- [ ] T046 Implement `src/App.tsx`: root component with client-side routing (React Router or hash-based): `/` → circuit canvas view; `/lessons` → `LessonCatalog`; `/lessons/:id` → `LessonPlayer`; `/exercises` → `ExerciseList`; `/exercises/:id` → `ExercisePlayer`; `/dashboard` → `ProgressDashboard`; initialise `progressStore.loadProgress(studentId)` on app mount (read studentId from URL param or default to 'anonymous'); render `useKeyboardShortcuts` at root; wrap app with minimum-screen-width guard
- [ ] T047 [P] Add minimum screen width notice in `src/App.tsx`: when `window.innerWidth < 320` display a full-screen notice "最小支援螢幕寬度為 320px" instead of the main UI (spec edge case)
- [ ] T048 [P] Harden short-circuit and component-limit edge cases: ensure `CircuitCanvas.tsx` renders a dismissible inline error banner (not a modal) with the `SimulationError.message` string when `result.status === 'error'`; ensure `ComponentPalette.tsx` disables drag/drop and shows tooltip when `circuit.components.length >= 50` (FR-004, spec edge case)
- [ ] T049 [P] Configure GitHub Pages deployment in `package.json`: add `"deploy": "npm run build && npx gh-pages -d dist"` script; verify `vite.config.ts` `base: '/2026/'` is set (quickstart.md)
- [ ] T050 Run full quickstart.md validation: `npm run dev` (verify app loads at localhost:5173), `npm run test` (all Vitest unit + component tests pass), `npm run build` (no build errors, dist/ produced), `npx playwright test` (all E2E scenarios pass across chromium/firefox/webkit); fix any failures before closing this task

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2; no dependency on US2/US3/US4
- **US2 (Phase 4)**: Depends on Phase 2; depends on `progressStore` type definitions from T006 but not on US1 implementation *(can proceed in parallel with US1 if staffed)*
- **US3 (Phase 5)**: Depends on Phase 2 and T040 (`progressStore`); no dependency on US1/US2 implementation *(independently testable)*
- **US4 (Phase 6)**: Depends on Phase 2 and T040 (`progressStore`); reuses `CircuitCanvas` from US1 *(start after US1 checkpoint)*
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational — no dependency on other stories
- **US2 (P2)**: Starts after Foundational — uses `progressStore` interface (defined in T006) but not its implementation; can develop `lessonStore` and lesson UI independently; integrates with `progressStore` at T035
- **US3 (P3)**: Starts after Foundational — `progressStore` implementation (T040) is the sole prerequisite
- **US4 (P4)**: Starts after US1 checkpoint — reuses `CircuitCanvas` component for the read-only exercise canvas

### Within Each User Story

- Tests MUST be written first and confirmed FAILING (RED) before implementation begins (Constitution V)
- Types and data files before stores
- Stores before components
- Leaf components before composite components
- Story complete and checkpointed before moving to next priority

### Parallel Opportunities

- T002–T005 (Setup): all parallelisable on different config files
- T007–T009 (Foundational utilities): all parallelisable (different files)
- T010–T012 (US1 unit tests): parallelisable
- T015–T017 (solver modules): parallelisable
- T021–T024 (canvas layers): parallelisable
- T026–T028 (toolbar + display components): parallelisable
- T030–T031 (hooks): parallelisable
- T036–T037 (US2 sub-components): parallelisable
- T044 (ExerciseList) and T043 (exercise data): parallelisable

---

## Parallel Example: User Story 1

```bash
# Write all unit tests in parallel (TDD RED phase):
Task: "MNA solver unit tests in tests/unit/solver/mna.test.ts"         # T010
Task: "Topology unit tests in tests/unit/solver/topology.test.ts"      # T011
Task: "SI format unit tests in tests/unit/utils/siFormat.test.ts"      # T012

# Implement all solver modules in parallel (after tests are RED):
Task: "Implement src/solver/mna.ts"                                     # T015
Task: "Implement src/solver/topology.ts"                               # T016
Task: "Implement src/solver/simplify.ts"                               # T017

# Implement all canvas layers in parallel (after stores are complete):
Task: "Implement src/components/canvas/GridLayer.tsx"                  # T021
Task: "Implement src/components/canvas/ComponentLayer.tsx"             # T022
Task: "Implement src/components/canvas/WireLayer.tsx"                  # T023
Task: "Implement src/components/canvas/SelectionOverlay.tsx"           # T024
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (TDD: write tests → implement → verify RED→GREEN)
4. **STOP and VALIDATE**: Open browser, place 10 Ω + 5 V + ground, verify 0.5 A displayed
5. Deploy preview to GitHub Pages if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 (US1) → Interactive circuit simulator ✅ → Deploy (MVP!)
3. Phase 4 (US2) → Guided lessons ✅ → Deploy
4. Phase 5 (US3) → Progress dashboard ✅ → Deploy
5. Phase 6 (US4) → Practice exercises ✅ → Deploy
6. Phase 7 → Polish, full E2E validation → Final release

### Parallel Team Strategy

With multiple developers (after Phase 2 complete):

- **Developer A**: Phase 3 — US1 circuit simulation
- **Developer B**: Phase 4 — US2 guided lessons (can start on data files + lessonStore independently)
- **Developer C**: Phase 5 — US3 progress dashboard (progressStore + ProgressDashboard)

---

## Notes

- `[P]` tasks operate on different files and have no unresolved dependencies — safe to parallelize
- `[Story]` label maps each task to a specific user story for traceability
- Constitution V (TDD): every implementation task group has preceding test tasks — **do not skip**
- Constitution VII: back up `/specs` and `.specify` before running `npm create vite@latest` in T001
- Commit after each completed task group; update checkbox in this file per Constitution VI
- Each story's **Checkpoint** is a hard gate — validate independently before proceeding
