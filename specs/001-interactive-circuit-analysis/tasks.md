# Tasks: 響應式互動學習電路分析 (Interactive Circuit Analysis)

**Input**: Design documents from `/specs/001-interactive-circuit-analysis/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Included per **Constitution V (TDD)** — test tasks appear before implementation tasks in every phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- **TDD**: Write tests first, confirm they FAIL (Red), then implement (Green), then refactor

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project scaffolding, install dependencies, configure tooling — protecting `/specs` and `.specify` directories per **Constitution VII**.

- [ ] T001 Initialize Vite + React + TypeScript project at repository root (`npm create vite@latest . -- --template react-ts`), verify `/specs` and `.specify` are not overwritten
- [ ] T002 Install runtime dependencies: `npm install konva react-konva zustand numeric`
- [ ] T003 [P] Install dev dependencies: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event`
- [ ] T004 [P] Install Playwright: `npm install -D playwright @playwright/test` and run `npx playwright install --with-deps chromium firefox webkit`
- [ ] T005 Configure Vitest in `vite.config.ts` (jsdom environment, coverage, include `tests/unit/**` and `tests/component/**`)
- [ ] T006 Configure Playwright in `playwright.config.ts` (baseURL `http://localhost:5173`, projects for chromium/firefox/webkit, mobile viewport presets for 320px/768px/1440px)
- [ ] T007 Create full directory structure per plan.md: `mkdir -p src/{components/{canvas,toolbar,simulation,lessons,exercises,dashboard},solver,stores,data/{lessons,exercises},utils,hooks,types} tests/{unit/{solver,utils},component,e2e}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript types, shared utilities, and App routing shell that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Define all TypeScript interfaces and types in `src/types/circuit.ts` (Component, ComponentType, Terminal, Wire, Circuit, SimulationResult, SimulationError, Lesson, LessonTopic, LessonStep, StepType, Exercise, StudentProgressRecord, CanvasAction, StepFeedback — per data-model.md)
- [ ] T009 [P] Implement `src/utils/persistence.ts` — localStorage read/write helpers: `loadRecords(studentId)`, `saveRecords(studentId, records[])`, with merge-before-write guard
- [ ] T010 [P] Implement `src/utils/siFormat.ts` — `formatSI(value: number, unit: string): string` supporting prefixes T, G, M, k, (none), m, µ, n, p per FR-015
- [ ] T011 [P] Implement `src/utils/connectivity.ts` — `getConnectedNodes(circuit): Map<terminalId, nodeId>` union-find algorithm for circuit topology
- [ ] T012 Create `src/App.tsx` routing shell with three named views: `canvas` (default), `lessons`, `dashboard`, using React state or hash routing (no server required)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Build and Simulate a Circuit (Priority: P1) 🎯 MVP

**Goal**: A student can place components (resistors, voltage sources, ground) on an interactive Konva canvas, connect them with wires, and immediately see DC simulation results (node voltages, branch currents, component power) update in ≤ 1 second. Full undo/redo (20 steps) and responsive layout (320 px–2560 px) included.

**Independent Test**: Open the app in a browser, drag a 10 Ω resistor and a 5 V voltage source onto the canvas, connect them with wires plus a ground node, and confirm the simulation panel shows I = 0.5 A and P = 2.5 W in real time.

### Tests for User Story 1 (TDD — write first, confirm FAIL before implementing)

- [ ] T013 [P] [US1] Write unit tests for MNA solver in `tests/unit/solver/mna.test.ts`: empty circuit → ok; 5 V + 10 Ω → 0.5 A / 2.5 W; short circuit → error type `short-circuit`; floating node → error type `floating-node`; >50 components → error type `component-limit`; no `Infinity`/`NaN` in outputs
- [ ] T014 [P] [US1] Write unit tests for topology analysis in `tests/unit/solver/topology.test.ts`: `getConnectedNodes` correct for series and parallel connections; `detectShortCircuit` returns empty for valid circuit and affected IDs for short
- [ ] T015 [P] [US1] Write unit tests for SI format in `tests/unit/utils/siFormat.test.ts`: `formatSI(0.5,'A')` → `"500 mA"`, `formatSI(4700,'Ω')` → `"4.7 kΩ"`, `formatSI(1e-6,'F')` → `"1 µF"`, boundary values at each prefix threshold
- [ ] T016 [P] [US1] Write component test for CircuitCanvas in `tests/component/CircuitCanvas.test.tsx`: renders canvas stage; palette items are accessible; undo/redo buttons respond to keyboard shortcuts Ctrl+Z / Ctrl+Y
- [ ] T017 [P] [US1] Write E2E test in `tests/e2e/us1-simulate-circuit.spec.ts` covering all three acceptance scenarios: (1) 10 Ω + 5 V → 0.5 A / 2.5 W displayed; (2) value change 10 Ω → 20 Ω updates within 1 s; (3) mobile viewport (375×667) renders without horizontal scroll

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement MNA solver core in `src/solver/mna.ts`: `solveCircuit(circuit): SimulationResult` — build G/B/C/D matrices, stamp each component, call `numeric.solve()`, handle singular matrix, return nodeVoltages/branchCurrents/componentPower; implement `detectShortCircuit(circuit): string[]`
- [ ] T019 [P] [US1] Implement topology analysis in `src/solver/topology.ts`: `getConnectedNodes(circuit): Map<string,string>` using union-find; short-circuit detection via zero-resistance loop check
- [ ] T020 [P] [US1] Implement series/parallel simplification in `src/solver/simplify.ts`: `simplifyCircuit(circuit): Circuit` — detect and merge series/parallel resistors, superposition theorem helper
- [ ] T021 [US1] Implement `src/stores/circuitStore.ts` (Zustand): all actions from circuit-store.contract.md (`addComponent`, `removeComponent`, `moveComponent`, `rotateComponent`, `updateComponentValue`, `addWire`, `removeWire`, `setSelected`, `clearAll`, `reset`); enforce 50-component limit
- [ ] T022 [US1] Implement `src/stores/simulationStore.ts` (Zustand): `result`, `isStale`, `solve(circuit)` — calls `solveCircuit`, sets `isStale = false`; subscribe to circuitStore changes and auto-trigger solve
- [ ] T023 [US1] Implement `src/stores/historyStore.ts` (Zustand): `past[]`, `future[]`, `canUndo`, `canRedo`, `execute(action)`, `undo()`, `redo()` with max 20 steps per FR-006 and data-model.md 2.3
- [ ] T024 [P] [US1] Implement `src/components/canvas/GridLayer.tsx` — Konva Layer rendering a dot/line grid background, responsive to canvas size
- [ ] T025 [P] [US1] Implement `src/components/canvas/ComponentLayer.tsx` — Konva Layer rendering draggable, rotatable component shapes (resistor, capacitor, inductor, voltage-source, current-source, ground); display value labels with `formatSI`
- [ ] T026 [P] [US1] Implement `src/components/canvas/WireLayer.tsx` — Konva Layer rendering wires as polylines with waypoints; interactive wire drawing on terminal click
- [ ] T027 [P] [US1] Implement `src/components/canvas/SelectionOverlay.tsx` — Konva Layer rendering selection bounding box and multi-select rectangle drag
- [ ] T028 [P] [US1] Implement `src/components/toolbar/ComponentPalette.tsx` — side panel listing all component types with drag-to-canvas and tap-to-place (FR-001, FR-014)
- [ ] T029 [P] [US1] Implement `src/components/toolbar/ActionBar.tsx` — undo/redo/clear buttons wired to historyStore and circuitStore; disable state follows `canUndo`/`canRedo`
- [ ] T030 [P] [US1] Implement `src/components/simulation/NodeVoltageDisplay.tsx` — overlay node voltage labels on the canvas at each connected node position, using `formatSI` for display
- [ ] T031 [P] [US1] Implement `src/components/simulation/SimulationPanel.tsx` — side panel showing branch currents and component power from `simulationStore.result`; show `SimulationError` message when `status === 'error'` (FR-004)
- [ ] T032 [US1] Implement `src/components/canvas/CircuitCanvas.tsx` — Konva Stage + all layers (Grid, Wire, Component, Selection, NodeVoltage); orchestrates circuitStore, simulationStore, historyStore; handles touch events (FR-014)
- [ ] T033 [P] [US1] Implement `src/hooks/useKeyboardShortcuts.ts` — bind Ctrl+Z → `historyStore.undo()`, Ctrl+Y / Ctrl+Shift+Z → `historyStore.redo()`, Delete/Backspace → `circuitStore.removeSelected()`
- [ ] T034 [P] [US1] Implement `src/hooks/useResponsive.ts` — `useResponsive(): { isMobile, isTablet, canvasWidth, canvasHeight }` using ResizeObserver; emit warning when viewport < 320 px (edge case FR-013)
- [ ] T035 [US1] Wire canvas view into `src/App.tsx`: render `<CircuitCanvas>`, `<ComponentPalette>`, `<ActionBar>`, `<SimulationPanel>` in responsive layout using `useResponsive`

**Checkpoint**: User Story 1 fully functional — place components, connect wires, view live simulation, undo/redo. E2E test suite passes.

---

## Phase 4: User Story 2 — Follow a Guided Circuit Analysis Lesson (Priority: P2)

**Goal**: A student can select a lesson from the catalog (e.g., KVL), follow step-by-step instructions on a pre-built canvas circuit, receive immediate correct/incorrect/hint feedback per step, and resume from their last completed step across sessions.

**Independent Test**: Select the KVL lesson, complete each step (submit at least one correct and one incorrect answer), verify feedback is shown, verify lesson reaches completion indicator, navigate away and return to confirm progress is preserved.

### Tests for User Story 2 (TDD — write first, confirm FAIL before implementing)

- [ ] T036 [P] [US2] Write component test for LessonPlayer in `tests/component/LessonPlayer.test.tsx`: renders step instruction; correct answer → success feedback; wrong answer → hint shown; skip step advances to next; all steps done → completion shown
- [ ] T037 [P] [US2] Write E2E test in `tests/e2e/us2-guided-lesson.spec.ts` covering all three acceptance scenarios: (1) complete all steps → completion indicator shown; (2) wrong answer → hint displayed without revealing answer; (3) navigate away and return → resumes from last step

### Implementation for User Story 2

- [ ] T038 [P] [US2] Create 10 lesson JSON files in `src/data/lessons/`: `ohms-law.json`, `kvl.json`, `kcl.json`, `series-circuit.json`, `parallel-circuit.json`, `thevenin.json`, `norton.json`, `nodal-analysis.json`, `mesh-analysis.json`, `superposition.json` — each with steps array per data-model.md 1.6 format and quickstart.md example
- [ ] T039 [US2] Implement `src/stores/lessonStore.ts` (Zustand): `currentLesson`, `currentStepIndex`, `feedback`, `loadLesson(lessonId)`, `submitAnswer(answer)` (evaluate against `expectedAnswer` with `tolerance`), `skipStep()`; integrate with progressStore to persist step completion
- [ ] T040 [P] [US2] Implement `src/components/lessons/LessonCatalog.tsx` — grid/list of available lessons with topic, difficulty, estimated time, prerequisite indicators, and completion status from progressStore (FR-007)
- [ ] T041 [P] [US2] Implement `src/components/lessons/StepFeedback.tsx` — displays correct/incorrect/partially-correct feedback with hint for wrong answers; shows explanation after correct; FR-009 requires response within 2 s
- [ ] T042 [US2] Implement `src/components/lessons/LessonPlayer.tsx` — step navigator, pre-built canvas (read-only topology), answer input area, StepFeedback integration, progress bar, sequential step gating (FR-008), skip button; wire to lessonStore
- [ ] T043 [US2] Wire lesson view into `src/App.tsx`: render `<LessonCatalog>` on lesson list route; render `<LessonPlayer>` on lesson detail route

**Checkpoint**: User Stories 1 AND 2 work independently. Lesson flow complete end-to-end with persistence.

---

## Phase 5: User Story 3 — Review Learning History and Progress (Priority: P3)

**Goal**: A student can view a progress dashboard listing all attempted lessons/exercises with scores and completion dates; an onboarding prompt is shown when no progress exists; the dashboard is fully responsive at 320 px.

**Independent Test**: Complete two lessons, navigate to the dashboard, verify both appear with scores and dates. Then clear progress (or use a fresh profile) and verify the onboarding prompt appears.

### Tests for User Story 3 (TDD — write first, confirm FAIL before implementing)

- [ ] T044 [P] [US3] Write E2E test in `tests/e2e/us3-progress-dashboard.spec.ts` covering all three acceptance scenarios: (1) completed lessons listed with score and date; (2) no progress → onboarding prompt shown; (3) mobile viewport (320 px) → readable without zooming

### Implementation for User Story 3

- [ ] T045 [US3] Implement `src/stores/progressStore.ts` (Zustand): `records`, `studentId`, `loadProgress(studentId)`, `startLesson(lessonId)`, `completeStep(lessonId, stepOrder)`, `recordExerciseAttempt(exerciseId, isCorrect)`, `getRecordFor(type, targetId)` — all per progress-store.contract.md; use `persistence.ts` for localStorage I/O
- [ ] T046 [US3] Implement `src/components/dashboard/ProgressDashboard.tsx` — list of StudentProgressRecords grouped by lesson/exercise; show score (0–100), completion status badge, completion date; show onboarding CTA when `records.length === 0`; responsive grid (FR-011, FR-013)
- [ ] T047 [US3] Wire dashboard view into `src/App.tsx`: render `<ProgressDashboard>` on dashboard route; initialize `progressStore.loadProgress(studentId)` on app mount

**Checkpoint**: All three user stories work independently. Progress persists across browser refresh (SC-006).

---

## Phase 6: User Story 4 — Practice with Circuit Analysis Exercises (Priority: P4)

**Goal**: A student can select an unguided exercise, use the interactive canvas, submit a numerical answer, receive a scored result with solution walkthrough (after max 3 attempts), and see the attempt recorded in the progress dashboard.

**Independent Test**: Open an exercise, enter the known correct answer → verify marked correct with walkthrough. Re-open, enter a wrong answer three times → verify solution revealed after third attempt. Check dashboard shows the exercise with attempt count.

### Tests for User Story 4 (TDD — write first, confirm FAIL before implementing)

- [ ] T048 [P] [US4] Write E2E test in `tests/e2e/us4-exercise.spec.ts` covering all three acceptance scenarios: (1) correct answer within ±2% tolerance → marked correct, walkthrough shown; (2) three wrong attempts → correct answer and explanation revealed; (3) canvas annotations persist throughout exercise session

### Implementation for User Story 4

- [ ] T049 [P] [US4] Create exercise data files in `src/data/exercises/` — at least 10 JSON files (one per topic in `LessonTopic`), each with `id`, `title`, `topic`, `difficulty`, `questionText`, `circuit` (pre-built), `correctAnswer`, `answerUnit`, `tolerancePercent: 2`, `maxAttempts: 3`, `solutionWalkthrough[]`
- [ ] T050 [P] [US4] Implement `src/components/exercises/ExerciseList.tsx` — filterable list of exercises by topic/difficulty, showing completion status from progressStore
- [ ] T051 [US4] Implement `src/components/exercises/ExercisePlayer.tsx` — display question + read-only pre-built circuit canvas with annotation layer; numeric answer input; evaluate against `correctAnswer ± tolerancePercent%` (FR-012 AC1); reveal walkthrough after `maxAttempts` wrong answers (FR-012 AC2); call `progressStore.recordExerciseAttempt` on each submission
- [ ] T052 [US4] Wire exercises into `src/App.tsx`: render `<ExerciseList>` on exercises list route; render `<ExercisePlayer>` on exercise detail route; integrate with progressStore

**Checkpoint**: All four user stories complete. Full feature functional end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Shared improvements, deployment config, edge cases, and final validation.

- [ ] T053 [P] Configure `vite.config.ts` `base` path for GitHub Pages deployment (e.g., `base: '/2026/'` per quickstart.md)
- [ ] T054 [P] Implement 320 px minimum width notice — display a full-screen overlay message when `window.innerWidth < 320` on any view (edge case from spec.md)
- [ ] T055 [P] Add 50-component canvas limit notice — display a friendly in-canvas message when component count reaches 50 (edge case from spec.md and circuitStore contract)
- [ ] T056 [P] Add short-circuit and floating-node visual indicators — highlight affected component/wire IDs from `SimulationError.affectedIds` on the canvas (FR-004, SC-007)
- [ ] T057 [P] Add offline/network awareness banner — display a notice when `navigator.onLine === false` and lesson progress cannot be confirmed (edge case from spec.md)
- [ ] T058 Run `npm run build` and verify dist/ output is clean with no TypeScript or Vite errors
- [ ] T059 Run `npm run test` (Vitest) and confirm all unit and component tests pass
- [ ] T060 Run `npx playwright test` and confirm all E2E tests pass across chromium, firefox, and webkit viewports (320 px, 768 px, 1440 px)
- [ ] T061 Run quickstart.md validation end-to-end: initialize → dev server → add circuit → run lesson → check dashboard → deploy to GitHub Pages preview

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no inter-story dependencies; 🎯 **MVP scope**
- **US2 (Phase 4)**: Depends on Phase 2 + progressStore skeleton (T045) for step persistence; can proceed after US1 types are stable
- **US3 (Phase 5)**: Depends on progressStore (T045); best after US2 to have meaningful data; independently testable
- **US4 (Phase 6)**: Depends on progressStore (T045) and circuitStore/canvas (US1); independently testable
- **Polish (Phase 7)**: Depends on all desired stories being complete

### User Story Dependencies

- **US1 (P1)**: Only depends on Foundational (Phase 2) — no other story dependencies
- **US2 (P2)**: Depends on Foundational; integrates with progressStore (first created in US3 phase — extract T045 earlier if US2 and US3 developed in parallel)
- **US3 (P3)**: Depends on Foundational and progressStore; integrates with US1/US2 data
- **US4 (P4)**: Depends on Foundational, circuitStore (US1), and progressStore (US3)

### Within Each Phase

- TDD: Tests MUST be written and confirmed FAILING before implementation tasks begin
- Types (`src/types/circuit.ts`, T008) before any store or component
- Stores before components that use them
- Utility functions before stores/components that call them
- Core component before wrapping/composing component

### Parallel Opportunities

- T003, T004 (dev dependency installs) can run in parallel after T002
- T009, T010, T011 (utility files) can run in parallel after T008
- T013–T017 (US1 tests) can all be written in parallel
- T018, T019, T020 (solver modules) can run in parallel
- T024–T031 (individual canvas sub-components) can run in parallel
- T033, T034 (hooks) can run in parallel with canvas components
- T036, T037 (US2 tests) can run in parallel
- T038 (lesson JSON files) can run in parallel with T039 (lessonStore)
- T049 (exercise JSON files) can run in parallel with T050 (ExerciseList)
- T053–T057 (polish tasks) can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1: Write all US1 tests in parallel (TDD Red phase)
Task T013: tests/unit/solver/mna.test.ts
Task T014: tests/unit/solver/topology.test.ts
Task T015: tests/unit/utils/siFormat.test.ts
Task T016: tests/component/CircuitCanvas.test.tsx
Task T017: tests/e2e/us1-simulate-circuit.spec.ts

# Step 2: Implement solver modules in parallel (all different files)
Task T018: src/solver/mna.ts
Task T019: src/solver/topology.ts
Task T020: src/solver/simplify.ts

# Step 3: Implement stores sequentially (circuitStore → simulationStore → historyStore)
Task T021 → T022 → T023

# Step 4: Implement canvas sub-components in parallel
Task T024: src/components/canvas/GridLayer.tsx
Task T025: src/components/canvas/ComponentLayer.tsx
Task T026: src/components/canvas/WireLayer.tsx
Task T027: src/components/canvas/SelectionOverlay.tsx
Task T028: src/components/toolbar/ComponentPalette.tsx
Task T029: src/components/toolbar/ActionBar.tsx
Task T030: src/components/simulation/NodeVoltageDisplay.tsx
Task T031: src/components/simulation/SimulationPanel.tsx

# Step 5: Assemble CircuitCanvas (depends on all sub-components)
Task T032: src/components/canvas/CircuitCanvas.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1**: Setup (T001–T007)
2. Complete **Phase 2**: Foundational (T008–T012) — CRITICAL, blocks everything
3. Complete **Phase 3**: User Story 1 (T013–T035)
4. **STOP AND VALIDATE**: Run `npm run test` + `npx playwright test`; demo the simulation canvas
5. Deploy to GitHub Pages preview if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 (P1) → test independently → Deploy (MVP!)
3. User Story 2 (P2) → test independently → Deploy
4. User Story 3 (P3) → test independently → Deploy
5. User Story 4 (P4) → test independently → Deploy
6. Polish → final build validation → Production deploy

### Parallel Team Strategy

With multiple developers, once Phase 2 is complete:
- **Developer A**: User Story 1 (T013–T035) — MNA solver + canvas
- **Developer B**: User Story 2 (T036–T043) — lesson system
- **Developer C**: User Story 3 + 4 (T044–T052) — progress + exercises

Stories integrate via shared types (`src/types/circuit.ts`) and progressStore (`src/stores/progressStore.ts`).

---

## Summary

| Phase | Tasks | Parallelizable |
|-------|-------|---------------|
| Phase 1: Setup | T001–T007 (7) | T003, T004, T006, T007 |
| Phase 2: Foundational | T008–T012 (5) | T009, T010, T011 |
| Phase 3: US1 (P1) 🎯 | T013–T035 (23) | T013–T020, T024–T031, T033–T034 |
| Phase 4: US2 (P2) | T036–T043 (8) | T036–T038, T040–T041 |
| Phase 5: US3 (P3) | T044–T047 (4) | T044 |
| Phase 6: US4 (P4) | T048–T052 (5) | T048–T050 |
| Phase 7: Polish | T053–T061 (9) | T053–T057 |
| **Total** | **61 tasks** | **~35 parallelizable** |

## Notes

- `[P]` tasks = different files, no blocking dependencies — safe to run concurrently
- `[Story]` label maps each task to its user story for traceability
- TDD: every story phase starts with test tasks; run them first, confirm FAIL, then implement
- Commit after each task or logical group; update this checklist by checking off completed items
- Stop at each **Checkpoint** to validate the story independently before proceeding
- Short-circuit and floating-node edge cases MUST be tested in T013 and handled in T018 (SC-007)
- Constitution VII: never overwrite `/specs` or `.specify` during project initialization (T001)
