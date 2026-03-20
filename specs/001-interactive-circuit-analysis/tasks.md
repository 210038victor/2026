# Tasks: 響應式互動學習電路分析 (Responsive Interactive Learning Circuit Analysis)

**Input**: Design documents from `/specs/001-interactive-circuit-analysis/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included per Constitution V (TDD) — test tasks appear **before** their implementation tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Each task includes an exact file path

## Path Conventions

Single-project SPA: `src/`, `tests/` at repository root (per plan.md structure)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Vite + React + TypeScript project and development tooling

- [ ] T001 Initialize Vite React TypeScript project at repository root with `npm create vite@latest . --template react-ts` (back up /specs and .specify first per Constitution VII)
- [ ] T002 Install runtime dependencies: konva, react-konva, zustand, numeric via `npm install konva react-konva zustand numeric`
- [ ] T003 [P] Install dev dependencies: vitest, @vitest/ui, jsdom, @testing-library/react, @testing-library/user-event, playwright, @playwright/test via `npm install -D`
- [ ] T004 [P] Install Playwright browsers with `npx playwright install --with-deps chromium firefox webkit`
- [ ] T005 Configure Vite with GitHub Pages base path `/2026/` and path alias `@` → `src/` in vite.config.ts
- [ ] T006 [P] Configure Vitest (jsdom environment, coverage, path aliases) in vite.config.ts
- [ ] T007 [P] Configure Playwright with base URL, mobile viewports (320px, 768px, 1440px) in playwright.config.ts
- [ ] T008 Configure TypeScript path alias `@/*` → `src/*` in tsconfig.json

**Checkpoint**: Project installs and `npm run dev` starts the dev server successfully

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, utilities, solver, and stores that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Define all TypeScript interfaces and types (Component, Wire, Circuit, SimulationResult, Lesson, LessonStep, Exercise, StudentProgressRecord, StepFeedback, CanvasAction, etc.) in src/types/circuit.ts
- [ ] T010 Create directory structure: `mkdir -p src/{components/{canvas,toolbar,simulation,lessons,exercises,dashboard},solver,stores,data/{lessons,exercises},utils,hooks,types} tests/{unit/{solver,utils},component,e2e}`
- [ ] T011 [P] Write unit tests for `formatSI()` utility covering all SI prefixes (p, n, µ, m, k, M, G, T) in tests/unit/utils/siFormat.test.ts
- [ ] T012 [P] Implement `formatSI(value, unit)` utility function (p through T prefixes, ~50 lines, zero deps) in src/utils/siFormat.ts
- [ ] T013 [P] Write unit tests for MNA solver: empty circuit, simple resistor+source, short circuit, floating node, component limit in tests/unit/solver/mna.test.ts
- [ ] T014 [P] Write unit tests for topology analysis: connected nodes, short-circuit detection in tests/unit/solver/topology.test.ts
- [ ] T015 Implement circuit connectivity utility `getConnectedNodes()` mapping terminal IDs to node IDs in src/utils/connectivity.ts
- [ ] T016 Implement MNA solver `solveCircuit()` and `detectShortCircuit()` using numeric.js `solve()` for matrix equations in src/solver/mna.ts
- [ ] T017 [P] Implement topology analysis `buildNodeMap()` and short-circuit detection in src/solver/topology.ts
- [ ] T018 [P] Implement series/parallel simplification and superposition helpers in src/solver/simplify.ts
- [ ] T019 [P] Implement localStorage read/write utility `loadFromStorage()` / `saveToStorage()` with JSON parse safety in src/utils/persistence.ts
- [ ] T020 Implement `circuitStore` Zustand store (addComponent, removeComponent, moveComponent, rotateComponent, updateComponentValue, addWire, removeWire, setSelected, clearAll, reset) per circuit-store.contract.md in src/stores/circuitStore.ts
- [ ] T021 [P] Implement `historyStore` Zustand store (execute, undo, redo — action queue+replay, max 20 steps per FR-006) in src/stores/historyStore.ts
- [ ] T022 [P] Implement `simulationStore` Zustand store (solve, isStale flag, auto-trigger on circuit change) in src/stores/simulationStore.ts
- [ ] T023 Implement root `App.tsx` with three-route layout (canvas workspace / lessons / progress dashboard) in src/App.tsx

**Checkpoint**: `npm test` passes all unit tests for solver and utils; foundation ready for user story work

---

## Phase 3: User Story 1 - Build and Simulate a Circuit (Priority: P1) 🎯 MVP

**Goal**: Student can place components on an interactive canvas, connect wires, and immediately see calculated DC values (voltage, current, power) updated in real time.

**Independent Test**: Open the app in a browser, place a 10 Ω resistor and a 5 V voltage source, connect them with wires and a ground node, and verify that 0.5 A current and 2.5 W power are displayed without manual calculation.

### Tests for User Story 1 (TDD — write and fail BEFORE implementation)

- [ ] T024 [P] [US1] Write E2E test: place resistor + voltage source, connect, verify current=0.5A and power=2.5W in tests/e2e/us1-simulate-circuit.spec.ts
- [ ] T025 [P] [US1] Write component test for CircuitCanvas: render, drag component, connect wire in tests/component/CircuitCanvas.test.tsx

### Implementation for User Story 1

- [ ] T026 [P] [US1] Implement `GridLayer` (background grid, Konva Layer) in src/components/canvas/GridLayer.tsx
- [ ] T027 [P] [US1] Implement `ComponentLayer` (draggable component shapes with terminal hit zones per FR-001, FR-005) in src/components/canvas/ComponentLayer.tsx
- [ ] T028 [P] [US1] Implement `WireLayer` (wire drawing between terminals per FR-002) in src/components/canvas/WireLayer.tsx
- [ ] T029 [P] [US1] Implement `SelectionOverlay` (selection box, multi-select per FR-005) in src/components/canvas/SelectionOverlay.tsx
- [ ] T030 [US1] Implement `CircuitCanvas` main Konva Stage composing all layers, wiring circuitStore + simulationStore (FR-003, FR-004) in src/components/canvas/CircuitCanvas.tsx
- [ ] T031 [P] [US1] Implement `ComponentPalette` drag-and-drop / tap-to-place toolbar (resistor, capacitor, inductor, voltage source, current source, ground per FR-001) in src/components/toolbar/ComponentPalette.tsx
- [ ] T032 [P] [US1] Implement `ActionBar` with undo/redo/clear buttons connected to historyStore (FR-006) in src/components/toolbar/ActionBar.tsx
- [ ] T033 [P] [US1] Implement `NodeVoltageDisplay` overlaying voltages on canvas nodes (FR-003, FR-015) in src/components/simulation/NodeVoltageDisplay.tsx
- [ ] T034 [US1] Implement `SimulationPanel` showing branch currents, component power, and error messages for short circuits (FR-003, FR-004) in src/components/simulation/SimulationPanel.tsx
- [ ] T035 [P] [US1] Implement `useKeyboardShortcuts` hook (Ctrl+Z undo, Ctrl+Y redo, Delete key per FR-006) in src/hooks/useKeyboardShortcuts.ts
- [ ] T036 [P] [US1] Implement `useResponsive` hook (breakpoint detection: 320px / 768px / 1440px / 2560px per FR-013) in src/hooks/useResponsive.ts

**Checkpoint**: US1 fully functional — student can build and simulate a DC circuit end-to-end; E2E test passes

---

## Phase 4: User Story 2 - Follow a Guided Circuit Analysis Lesson (Priority: P2)

**Goal**: Student selects a lesson from a catalog, follows step-by-step instructions, submits answers, receives immediate feedback, and has their progress persisted across sessions.

**Independent Test**: Select the KVL lesson, complete all steps submitting one correct and one incorrect answer, verify feedback messages appear, navigate away and return to verify progress is resumed from the last completed step.

### Tests for User Story 2 (TDD — write and fail BEFORE implementation)

- [ ] T037 [P] [US2] Write E2E test: open KVL lesson, submit correct/incorrect answers, verify feedback and progress persistence in tests/e2e/us2-guided-lesson.spec.ts
- [ ] T038 [P] [US2] Write component test for LessonPlayer: step navigation, answer submission, feedback display in tests/component/LessonPlayer.test.tsx

### Implementation for User Story 2

- [ ] T039 [US2] Create 10 lesson JSON data files (ohms-law.json, kvl.json, kcl.json, series-circuit.json, parallel-circuit.json, thevenin.json, norton.json, nodal-analysis.json, mesh-analysis.json, superposition.json) in src/data/lessons/
- [ ] T040 [US2] Implement `lessonStore` Zustand store (loadLesson, submitAnswer with tolerance check, skipStep, feedback state per lessonStore.contract.md) in src/stores/lessonStore.ts
- [ ] T041 [P] [US2] Implement `LessonCatalog` component listing all lessons grouped by topic with difficulty badges (FR-007) in src/components/lessons/LessonCatalog.tsx
- [ ] T042 [P] [US2] Implement `StepFeedback` component showing correct/incorrect/partially-correct messages and hints within 2 seconds (FR-009) in src/components/lessons/StepFeedback.tsx
- [ ] T043 [US2] Implement `LessonPlayer` component with sequential step rendering, answer input types (enter-value, place-component, connect-wire, etc.), progress persistence via progressStore (FR-008, FR-010) in src/components/lessons/LessonPlayer.tsx

**Checkpoint**: US2 fully functional — student can complete a guided lesson end-to-end with feedback and progress saved; E2E test passes

---

## Phase 5: User Story 3 - Review Learning History and Progress (Priority: P3)

**Goal**: Student views a personal progress dashboard showing completed lessons, scores, and completion dates; prompted to start if no lessons completed yet.

**Independent Test**: Complete two lessons, navigate to the progress dashboard, verify both lessons appear with scores and completion dates; open dashboard with no completed lessons and verify onboarding prompt is shown.

### Tests for User Story 3 (TDD — write and fail BEFORE implementation)

- [ ] T044 [P] [US3] Write E2E test: complete two lessons, open dashboard, verify entries with scores; test empty-state onboarding prompt in tests/e2e/us3-progress-dashboard.spec.ts

### Implementation for User Story 3

- [ ] T045 [US3] Implement `progressStore` Zustand store (loadProgress, startLesson, completeStep, recordExerciseAttempt, getRecordFor) with localStorage persistence per progress-store.contract.md in src/stores/progressStore.ts
- [ ] T046 [US3] Implement `ProgressDashboard` component (completed lessons list with scores and dates, exercises attempted, empty-state onboarding prompt per FR-011) in src/components/dashboard/ProgressDashboard.tsx

**Checkpoint**: US3 fully functional — progress dashboard shows accurate history; E2E test passes

---

## Phase 6: User Story 4 - Practice with Circuit Analysis Exercises (Priority: P4)

**Goal**: Student selects an unguided exercise, solves it using the interactive canvas, submits a numeric answer, and receives a scored result with a step-by-step solution walkthrough.

**Independent Test**: Open an exercise, submit the known correct answer (within ±2% tolerance) and verify it is marked correct with the solution walkthrough; re-attempt with a wrong answer and verify feedback after the max attempts limit is reached.

### Tests for User Story 4 (TDD — write and fail BEFORE implementation)

- [ ] T047 [P] [US4] Write E2E test: open exercise, submit correct answer (±2% tolerance), verify correct score; submit wrong answer 3 times and verify solution walkthrough is shown in tests/e2e/us4-exercise.spec.ts

### Implementation for User Story 4

- [ ] T048 [US4] Create 10+ exercise JSON data files with circuit, question, correctAnswer, tolerancePercent, maxAttempts, solutionWalkthrough in src/data/exercises/
- [ ] T049 [P] [US4] Implement `ExerciseList` component showing exercises grouped by topic and difficulty (FR-012) in src/components/exercises/ExerciseList.tsx
- [ ] T050 [US4] Implement `ExercisePlayer` component with read-only canvas, numeric answer input with ±2% tolerance check, attempt counter, solution walkthrough reveal after maxAttempts (FR-012) in src/components/exercises/ExercisePlayer.tsx

**Checkpoint**: US4 fully functional — student can complete exercises with scored results; E2E test passes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, edge cases, performance, and deployment

- [ ] T051 [P] Validate responsive layout at 320px, 768px, 1440px, 2560px viewports using Playwright across Chrome, Firefox, WebKit (FR-013, SC-004)
- [ ] T052 [P] Validate full touch interaction support (drag, tap-to-place, pinch-zoom) on mobile viewports using Playwright (FR-014)
- [ ] T053 Validate all short-circuit, floating-node, and component-limit edge cases return user-friendly error messages with no Infinity/NaN values (FR-004, SC-007)
- [ ] T054 Validate circuit value update latency ≤ 1 second on standard consumer device using Playwright performance timing (FR-003, SC-002)
- [ ] T055 [P] Configure GitHub Pages deployment: set `base: '/2026/'` in vite.config.ts, add `gh-pages` deploy script to package.json
- [ ] T056 Run quickstart.md validation end-to-end (init → install → dev server → tests → build → preview) and verify all steps pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no dependency on US2/US3/US4
- **US2 (Phase 4)**: Depends on Phase 2 — no dependency on US1 (can start in parallel with US1 if staffed)
- **US3 (Phase 5)**: Depends on Phase 2 — uses progressStore (shared with US2); start after US2 for store reuse
- **US4 (Phase 6)**: Depends on Phase 2 — can start in parallel with US1/US2/US3 if staffed
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — purely canvas + solver
- **US2 (P2)**: No dependency on US1 — shares lessonStore and progressStore only
- **US3 (P3)**: Reuses progressStore from US2; implement US2 first to avoid duplication
- **US4 (P4)**: No dependency on US1/US2/US3 — shares canvas interaction patterns from US1

### Within Each Phase (TDD Order)

1. **Write tests FIRST** — confirm they fail (Red)
2. **Implement** minimum code to pass tests (Green)
3. **Refactor** while keeping tests green
4. Models → Services/Stores → Components
5. Commit after each task or logical group

### Parallel Opportunities

- All [P]-marked tasks have no file conflicts and can run simultaneously
- Phase 1 setup tasks T003, T004, T006, T007, T008 can all run in parallel after T001/T002
- Phase 2: solver tests (T013, T014) and utility tests (T011) can run in parallel
- Phase 2: solver impl (T016, T017, T018) and store impl (T020, T021, T022) can run in parallel
- Once Phase 2 is complete, all four user story phases can be worked on simultaneously by different developers

---

## Parallel Example: User Story 1

```bash
# Step 1 (parallel): Write tests FIRST
Task T024: "Write E2E test for circuit simulation in tests/e2e/us1-simulate-circuit.spec.ts"
Task T025: "Write component test for CircuitCanvas in tests/component/CircuitCanvas.test.tsx"

# Step 2 (parallel): Canvas layers (no file conflicts)
Task T026: "Implement GridLayer in src/components/canvas/GridLayer.tsx"
Task T027: "Implement ComponentLayer in src/components/canvas/ComponentLayer.tsx"
Task T028: "Implement WireLayer in src/components/canvas/WireLayer.tsx"
Task T029: "Implement SelectionOverlay in src/components/canvas/SelectionOverlay.tsx"
Task T031: "Implement ComponentPalette in src/components/toolbar/ComponentPalette.tsx"
Task T032: "Implement ActionBar in src/components/toolbar/ActionBar.tsx"
Task T033: "Implement NodeVoltageDisplay in src/components/simulation/NodeVoltageDisplay.tsx"
Task T035: "Implement useKeyboardShortcuts in src/hooks/useKeyboardShortcuts.ts"
Task T036: "Implement useResponsive in src/hooks/useResponsive.ts"

# Step 3 (sequential): Compose (depends on all layers above)
Task T030: "Implement CircuitCanvas composing all layers in src/components/canvas/CircuitCanvas.tsx"
Task T034: "Implement SimulationPanel in src/components/simulation/SimulationPanel.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `npm test` + `npx playwright test tests/e2e/us1-simulate-circuit.spec.ts`
5. Deploy to GitHub Pages for demo

### Incremental Delivery

1. Setup + Foundational → Foundation ready (`npm test` green)
2. Add US1 → Test independently → Deploy/Demo (**MVP!**)
3. Add US2 → Test independently → Deploy/Demo
4. Add US3 → Test independently → Deploy/Demo
5. Add US4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2 completes:

- **Developer A**: User Story 1 (canvas, solver integration)
- **Developer B**: User Story 2 (lessons, lessonStore)
- **Developer C**: User Story 3 + 4 (progressStore, exercises, dashboard)

---

## Notes

- [P] tasks = different files, no inter-dependencies — safe to run simultaneously
- [Story] label maps each task to its user story for traceability
- Each user story is independently completable and testable
- **TDD**: Verify tests FAIL before implementing (Constitution V)
- Commit after each task or logical group (Constitution VI)
- Protect `/specs` and `.specify` directories during `npm create vite` scaffolding (Constitution VII)
- Component limit: 50 per canvas (circuitStore invariant, FR-004 edge case)
- `formatSI()` must support: T, G, M, k, (none), m, µ, n, p prefixes (FR-015)
- All SI-formatted values must appear in simulation results and component labels
