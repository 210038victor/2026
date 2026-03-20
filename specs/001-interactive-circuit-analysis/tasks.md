# Tasks: 響應式互動學習電路分析 (Responsive Interactive Learning Circuit Analysis)

**Input**: Design documents from `/specs/001-interactive-circuit-analysis/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅  
**Branch**: `001-interactive-circuit-analysis`  
**Tests**: TDD required per Constitution V — test tasks appear **before** their implementation tasks  
**Organization**: Tasks grouped by user story to enable independent implementation and testing

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story this task belongs to (US1–US4, maps to spec.md priorities)
- **No story label**: Setup, Foundational, or Polish phase
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the React + Vite + TypeScript project, install all dependencies, and configure tooling so every subsequent task has a working build environment.

> **Note**: Use `npm create vite@latest . -- --template react-ts` at repo root. The `.` target ensures the existing `/specs` and `.specify` directories are preserved (Constitution VII).

- [X] T001 Initialize Vite + React + TypeScript project at repo root: run `npm create vite@latest . -- --template react-ts` and confirm `src/main.tsx`, `index.html`, and `vite.config.ts` are created without overwriting `/specs` or `.specify`
- [X] T002 Install runtime dependencies: `npm install konva react-konva zustand numeric react-router-dom nanoid` and verify versions in `package.json`
- [X] T003 [P] Install dev dependencies: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @types/react @types/react-dom @vitejs/plugin-react`
- [X] T004 [P] Install Playwright and browser drivers: `npm install -D @playwright/test` then `npx playwright install --with-deps chromium firefox webkit`
- [X] T005 Configure `vite.config.ts` — set `base: '/2026/'` for GitHub Pages, add `resolve.alias: { '@': path.resolve(__dirname, 'src') }`, add `test: { environment: 'jsdom', globals: true, coverage: { provider: 'v8' } }`
- [X] T006 [P] Configure `tsconfig.json` — enable `strict: true`, `baseUrl: "."`, `paths: { "@/*": ["src/*"] }`, `types: ["vitest/globals"]`
- [X] T007 Create full directory tree per plan.md: `mkdir -p src/{components/{canvas/shapes,toolbar,simulation,lessons,exercises,dashboard,layout},solver,stores,data/{lessons,exercises},utils,hooks,types,pages} tests/{unit/{solver,utils,stores},component,e2e}`
- [X] T008 [P] Configure ESLint in `eslint.config.js` (recommended rules + react-hooks + typescript-eslint) and Prettier in `.prettierrc` (singleQuote: true, semi: true, tabWidth: 2)
- [X] T009 Add npm scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`, `"e2e": "playwright test"`, `"e2e:report": "playwright test --reporter=html"`, `"preview": "vite preview"`, `"deploy": "npm run build && npx gh-pages -d dist"`
- [X] T010 [P] Create GitHub Pages deploy workflow in `.github/workflows/deploy.yml` — triggers on push to `main`, runs `npm ci && npm run build`, deploys `dist/` to `gh-pages` branch using `actions/deploy-pages`
- [X] T011 Clean Vite boilerplate — delete `src/App.css`, `src/assets/react.svg`, replace contents of `src/index.css` with a minimal CSS reset, and replace `src/App.tsx` with an empty placeholder export

**Checkpoint**: `npm run dev` starts at `http://localhost:5173`; `npm run build` produces `dist/` without errors — project scaffold ready ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript types, shared utilities, all four Zustand stores, localStorage persistence, routing skeleton, and shared hooks. **Every user story depends on this phase.**

> **⚠️ CRITICAL**: No user story work can begin until all Phase 2 tasks are complete and tests pass.

### Type Definitions

- [X] T012 Define all TypeScript interfaces and enums in `src/types/circuit.ts` — `ComponentType`, `Terminal`, `Component`, `Wire`, `Circuit`, `SimulationError`, `SimulationResult`, `LessonTopic`, `StepType`, `LessonStep`, `Lesson`, `Exercise`, `StudentProgressRecord`, `CanvasAction`, `StepFeedback`, `CircuitState`, `SimulationState`, `HistoryState`, `LessonState`, `ProgressState` (exact shapes from `data-model.md`)

### Utility Tests (Write First — Must FAIL before implementation)

- [X] T013 Write unit tests for SI formatter in `tests/unit/utils/siFormat.test.ts` — cover all 8 prefix ranges (T, G, M, k, base, m, µ, n, p), edge cases: 0, negative values, `formatSI(4700, 'Ω') → '4.7 kΩ'`, `formatSI(0.5, 'A') → '500 mA'`, `formatSI(1e-6, 'F') → '1 µF'`
- [X] T014 [P] Write unit tests for persistence utility in `tests/unit/utils/persistence.test.ts` — test `loadFromStorage` (found/not-found/corrupt-JSON), `saveToStorage` (stringify/parse roundtrip), `mergeRecords` (deduplication by id)

### Utility Implementation

- [X] T015 [P] Implement `formatSI()` in `src/utils/siFormat.ts` — map value to nearest SI prefix (T=10¹², G=10⁹, M=10⁶, k=10³, none=10⁰, m=10⁻³, µ=10⁻⁶, n=10⁻⁹, p=10⁻¹²); render to 3 significant figures; append unit string; guard against 0 and non-finite inputs (FR-015)
- [X] T016 [P] Implement persistence utility in `src/utils/persistence.ts` — `loadFromStorage<T>(key): T | null` (try/catch JSON.parse), `saveToStorage<T>(key, value): void` (try/catch JSON.stringify), `mergeRecords(existing, incoming): StudentProgressRecord[]` (merge by id, no duplicates, preserve completed status)
- [X] T017 [P] Implement connectivity utility in `src/utils/connectivity.ts` — `buildNodeMap(circuit): Map<terminalId, nodeId>` using union-find over `Wire[]` to group connected terminals into nodes; `getIsolatedTerminals(circuit): string[]` returning terminal IDs with no wire connections

### Store Tests (Write First — Must FAIL before implementation)

- [X] T018 Write contract tests for circuitStore in `tests/unit/stores/circuitStore.test.ts` — test all 9 actions from `circuit-store.contract.md`: `addComponent` (enforces ≤ 50 limit), `removeComponent` (cascades wire removal), `moveComponent`, `rotateComponent` (0→90→180→270→0 cycle), `updateComponentValue` (rejects value ≤ 0), `addWire` (duplicate guard), `removeWire`, `setSelected`, `clearAll`; verify all invariants
- [X] T019 [P] Write contract tests for progressStore in `tests/unit/stores/progressStore.test.ts` — test all 5 actions from `progress-store.contract.md`: `loadProgress` (reads correct localStorage key), `startLesson` (status: in-progress), `completeStep` (deduplication, auto-complete when all steps done), `recordExerciseAttempt` (score calculation, attempt count), `getRecordFor`; verify no-backwards status transitions
- [X] T022 [P] Write unit tests for historyStore in `tests/unit/stores/historyStore.test.ts` — test `execute` (adds to past, clears future), `undo` (moves past→future, replays remaining), `redo` (moves future→past), 20-step cap (oldest action dropped), `canUndo`/`canRedo` flags

### Store Implementation

- [X] T020 Implement `src/stores/circuitStore.ts` per `circuit-store.contract.md` — all 9 actions using Zustand `create()` + Immer middleware; enforce `components.length < 50` in `addComponent`; cascade-delete wires in `removeComponent`; update `circuit.updatedAt` after every mutation
- [X] T021 Implement `src/stores/historyStore.ts` — `CanvasAction` queue with `past: CanvasAction[]` (max 20) and `future: CanvasAction[]`; `execute(action)` appends to past and clears future; `undo()` pops past → applies reverse; `redo()` pops future → re-applies; expose `canUndo`/`canRedo` booleans
- [X] T023 [P] Implement `src/stores/simulationStore.ts` — `result: SimulationResult | null`, `isStale: boolean`; `solve(circuit)` action that calls `solveCircuit(circuit)` from MNA solver (imported lazily once solver exists), stores result, clears `isStale`; `markStale()` action sets `isStale = true`
- [X] T024 Implement `src/stores/progressStore.ts` per `progress-store.contract.md` — Zustand store backed by `persistence.ts`; `loadProgress(studentId)` reads `progress::${studentId}` from localStorage; all mutations persist immediately; `score` = `(completedSteps.length / totalSteps) * 100` on completion

### Application Skeleton

- [X] T025 Create `src/App.tsx` with React Router `<Routes>` — routes: `/` → `HomePage`, `/lessons` → `LessonsPage`, `/lessons/:lessonId` → `LessonPlayerPage`, `/exercises` → `ExercisesPage`, `/exercises/:exerciseId` → `ExercisePlayerPage`, `/dashboard` → `DashboardPage`; wrap in `<BrowserRouter>` with `basename="/2026/"`
- [X] T026 [P] Create `src/components/layout/NavBar.tsx` — responsive top navigation with links to Home (canvas icon), Lessons, Exercises, Dashboard; collapses to hamburger menu below 768 px; uses `useResponsive` hook
- [X] T027 [P] Create placeholder page files: `src/pages/HomePage.tsx`, `src/pages/LessonsPage.tsx`, `src/pages/LessonPlayerPage.tsx`, `src/pages/ExercisesPage.tsx`, `src/pages/ExercisePlayerPage.tsx`, `src/pages/DashboardPage.tsx` — each exports a minimal `<div>` with page title; import types from `src/types/circuit.ts`
- [X] T028 Create `src/hooks/useResponsive.ts` — `useResponsive(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean; width: number }` using `window.matchMedia` listeners; breakpoints: mobile < 768 px, tablet 768–1023 px, desktop ≥ 1024 px
- [X] T029 [P] Create `src/hooks/useKeyboardShortcuts.ts` — `useKeyboardShortcuts(handlers: { onUndo, onRedo, onDelete })` attaches `keydown` event listener on mount, detaches on unmount; maps `Ctrl+Z` → `onUndo`, `Ctrl+Y` / `Ctrl+Shift+Z` → `onRedo`, `Delete` / `Backspace` → `onDelete`; ignores events when focus is in an `<input>` or `<textarea>`

**Checkpoint**: `npm run test` — all foundation tests pass (formatSI ✅ persistence ✅ circuitStore ✅ historyStore ✅ progressStore ✅). User story work can now begin. ✅

---

## Phase 3: User Story 1 — Build and Simulate a Circuit (Priority: P1) 🎯 MVP

**Goal**: A student can place components (resistor, voltage source, capacitor, inductor, current source, ground) on an interactive canvas, connect them with wires, and immediately see DC node voltages, branch currents, and component power. Undo/redo, move, rotate, and delete are all functional. Short-circuit and floating-node errors show descriptive banners. Fully responsive to 320 px–2560 px and operable with touch.

**Independent Test**: Open the module, place a 10 Ω resistor and 5 V voltage source, connect them with ground, and verify that `I = 0.5 A` and `P = 2.5 W` are displayed without manual calculation. Change the resistor to 20 Ω and verify values update in < 1 s. Load on a 375 px mobile viewport and verify all controls are usable by touch.

### Tests for User Story 1 (TDD — Write First, Must FAIL)

- [X] T030 [US1] Write MNA solver unit tests in `tests/unit/solver/mna.test.ts` — cover all 6 contract scenarios from `mna-solver.contract.md`: empty circuit → `status: 'ok'`; ground-only → `ok` with no voltages; 5 V + 10 Ω + ground → `I = 0.5 A`, `P = 2.5 W`; zero-resistance loop → `status: 'error' type: 'short-circuit'`; unconnected component → `type: 'floating-node'`; 51 components → `type: 'component-limit'`; verify no NaN/Infinity in any output
- [X] T031 [P] [US1] Write topology analysis unit tests in `tests/unit/solver/topology.test.ts` — test `buildNodeMap` (3-terminal circuit → correct union-find grouping), `detectShortCircuit` (empty → [], parallel voltage sources → affected IDs), `getIsolatedTerminals` (disconnected component → its terminal IDs returned)
- [X] T032 [P] [US1] Write component tests for CircuitCanvas in `tests/component/CircuitCanvas.test.tsx` — render empty canvas (Stage present), add component via `circuitStore` and verify Konva Group rendered, simulation result overlay shows formatted voltage label, error banner appears when `simulationStore.result.status === 'error'`
- [X] T033 [P] [US1] Write E2E tests for US1 in `tests/e2e/us1-simulate-circuit.spec.ts` — Playwright scenarios: (1) desktop: place resistor + voltage source + ground → connect → verify `0.5 A` text visible; (2) change resistor value → verify values update within 1 s; (3) 375 px mobile viewport: all controls visible + no horizontal scroll; (4) create short circuit → verify error banner text contains 'short' (not Infinity)

### Solver Implementation

- [X] T034 [US1] Implement topology analysis in `src/solver/topology.ts` — export `buildNodeMap(circuit: Circuit): Map<string, string>` (union-find over `circuit.wires`), `detectShortCircuit(circuit: Circuit): string[]` (identify zero-resistance loops), `getIsolatedTerminals(circuit: Circuit): string[]` (uses `buildNodeMap`)
- [X] T035 [US1] Implement MNA solver in `src/solver/mna.ts` — export `solveCircuit(circuit: Circuit): SimulationResult` as pure function; stamp G-matrix contributions for resistors (`1/R`), voltage sources (auxiliary branch current row/col), current sources (RHS vector); number nodes with ground = 0; call `numeric.solve(A, b)`; catch singular matrix (|det| < 1e-12 → `'singular-matrix'` or `'short-circuit'`); compute `componentPower`; guard all outputs against NaN/Infinity; respect DC treatment: capacitor = open-circuit (skip stamping), inductor = short-circuit (0 Ω resistor stamp)
- [X] T036 [P] [US1] Implement DC simplification helpers in `src/solver/simplify.ts` — export `getSeriesResistance(values: number[]): number`, `getParallelResistance(values: number[]): number`, `applySuperposition(circuit: Circuit): SimulationResult[]` (zero each independent source in turn, sum results); these support FR-016

### Canvas Component Shapes

- [X] T037 [P] [US1] Create Konva component shapes in `src/components/canvas/shapes/` — one file per type: `ResistorShape.tsx` (zigzag rect), `VoltageSourceShape.tsx` (circle with +/−), `CurrentSourceShape.tsx` (circle with arrow), `CapacitorShape.tsx` (parallel plates), `InductorShape.tsx` (coil bumps), `GroundShape.tsx` (horizontal lines); each accepts `{ rotation, selected, value, unit }` props and renders a `<Group>` with terminal dots at correct offsets from `data-model.md` Terminal offsets

### Canvas Layer Components

- [X] T038 [US1] Create `src/components/canvas/GridLayer.tsx` — Konva `<Layer>` with 20 px grid lines drawn using `<Line>` nodes; grid color `#e5e7eb`; responsive: redraws when Stage width/height changes; snap-to-grid helper `snapToGrid(x, y, gridSize = 20): {x, y}`
- [X] T039 [US1] Create `src/components/canvas/WireLayer.tsx` — Konva `<Layer>` rendering each `Wire` as `<Line points={[...waypoints]}>`; manages in-progress wire drawing state (first terminal selected → track mouse/touch to canvas pointer → second terminal click completes wire via `circuitStore.addWire`); highlights wire in blue when hovered; calls `circuitStore.removeWire` on double-click
- [X] T040 [US1] Create `src/components/canvas/ComponentLayer.tsx` — Konva `<Layer>` rendering each `Component` as a draggable `<Group>` containing the appropriate shape from T037; `onDragEnd` → `circuitStore.moveComponent` snapped to grid; double-click → `circuitStore.rotateComponent`; click → `circuitStore.setSelected`; terminal circles rendered as hit zones for wire drawing
- [X] T041 [P] [US1] Create `src/components/canvas/SelectionOverlay.tsx` — Konva `<Layer>` for rubber-band selection; `mousedown`/`touchstart` on empty canvas starts drag rect; `mouseup`/`touchend` calculates intersecting components and calls `circuitStore.setSelected(ids)`
- [X] T042 [US1] Create `src/components/canvas/CircuitCanvas.tsx` — Konva `<Stage>` containing `GridLayer`, `WireLayer`, `ComponentLayer`, `SelectionOverlay`; `useResponsive` for dynamic width/height filling parent container; `pixelRatio` = `window.devicePixelRatio`; `preventDefault` on touch events to block browser pan/zoom; exposes `stageRef` for screenshot capability

### Toolbar Components

- [X] T043 [P] [US1] Create `src/components/toolbar/ComponentPalette.tsx` — renders one drag-source button per `ComponentType`; desktop: drag component icon onto canvas → `dragstart` carries type, `CircuitCanvas` `onDrop` calls `circuitStore.addComponent`; mobile: tap-to-select type then tap canvas position to place; disables all buttons + shows tooltip when `circuit.components.length >= 50` (FR-004 edge case)
- [X] T044 [P] [US1] Create `src/components/toolbar/ActionBar.tsx` — Undo button (Ctrl+Z, disabled when `!canUndo`), Redo button (Ctrl+Y, disabled when `!canRedo`), Clear All button (with confirmation dialog); reads state from `historyStore`; calls `historyStore.undo()` / `historyStore.redo()`; `clearAll()` dispatches `circuitStore.clearAll()` and resets `historyStore`

### Simulation Display Components

- [X] T045 [US1] Create `src/components/simulation/NodeVoltageDisplay.tsx` — overlaid absolutely positioned `<div>` labels on the canvas; reads `simulationStore.result.nodeVoltages`; positions labels near each node using the same coordinate system as `ComponentLayer`; formats values with `formatSI(v, 'V')`; hidden when `result.status === 'error'` or `result === null`
- [X] T046 [P] [US1] Create `src/components/simulation/SimulationPanel.tsx` — collapsible side/bottom panel (side on desktop, bottom sheet on mobile); displays table of `nodeVoltages`, `branchCurrents`, `componentPower` from `simulationStore.result` formatted with `formatSI`; shows spinner overlay while `isStale === true`; collapses automatically if no circuit components present
- [X] T047 [P] [US1] Create `src/components/simulation/SimulationErrorBanner.tsx` — full-width red banner at top of canvas showing `simulationStore.result.error.message`; lists `affectedIds` as highlighted component labels; dismissible via ×; automatically shows when `result.status === 'error'`; hidden otherwise (FR-004, SC-007)

### Hooks & Integration

- [X] T048 [US1] Create `src/hooks/useSimulationEffect.ts` — `useSimulationEffect()` subscribes to `circuitStore` changes via Zustand `subscribe`; debounces calls by 200 ms to avoid redundant solves on rapid edits; calls `simulationStore.solve(circuit)` after debounce; calls `simulationStore.markStale()` immediately on each circuit change so `isStale` spinner appears (SC-002 ≤ 1 s)
- [X] T049 [P] [US1] Create `src/components/canvas/ComponentValueEditor.tsx` — appears as an inline popover when user clicks a placed component's value label; `<input type="number">` with current value pre-filled; validates `value > 0` and shows inline error for ≤ 0 (circuit-store.contract.md pre-condition); on confirm: calls `circuitStore.updateComponentValue(id, value)` and records `CanvasAction` in `historyStore.execute`; formats display with `formatSI` (FR-015)
- [X] T050 [P] [US1] Create `src/components/layout/MinScreenWarning.tsx` — renders a full-screen overlay when `useResponsive().width < 320` with message "畫面寬度過窄（最低支援 320 px）"; blocks all interaction beneath it (spec edge case)
- [X] T051 [US1] Assemble `src/pages/HomePage.tsx` — compose `<CircuitCanvas>`, `<ComponentPalette>`, `<ActionBar>`, `<SimulationPanel>`, `<NodeVoltageDisplay>`, `<SimulationErrorBanner>`, `<MinScreenWarning>`; call `useSimulationEffect()` to wire reactive simulation; call `useKeyboardShortcuts` with `onUndo`, `onRedo`, `onDelete` connected to historyStore/circuitStore; layout: toolbar top/left, canvas fills remaining space, panel right (desktop) / bottom (mobile) using CSS Grid + media queries

**Checkpoint**: `npm run test` (unit + component) + `npx playwright test tests/e2e/us1-simulate-circuit.spec.ts` — all US1 tests pass. Manually verify: place 10 Ω + 5 V + ground → `I = 0.5 A`, `P = 2.5 W` displayed; undo/redo cycle works; mobile viewport fully functional. ✅

---

## Phase 4: User Story 2 — Follow a Guided Circuit Analysis Lesson (Priority: P2)

**Goal**: A student selects a lesson from a catalog (10 lessons covering Ohm's Law, KVL, KCL, series, parallel, Thévenin, Norton, nodal analysis, mesh analysis, superposition), follows step-by-step instructions, receives immediate feedback for correct/incorrect answers, and can resume an in-progress lesson after navigating away. Progress is persisted to localStorage.

**Independent Test**: Select the KVL lesson, complete each step in order with one correct and one incorrect submission, verify hint appears on wrong answer, verify completion indicator appears at the end, navigate away and return to verify resume from last step.

### Tests for User Story 2 (TDD — Write First, Must FAIL)

- [X] T052 [US2] Write unit tests for lessonStore in `tests/unit/stores/lessonStore.test.ts` — test `loadLesson` (populates `currentLesson`, resets `currentStepIndex` to 0), `submitAnswer` with correct value (advances step, sets `feedback.isCorrect = true`, calls `progressStore.completeStep`), `submitAnswer` with wrong value (stays on same step, `feedback.isCorrect = false`, hint populated), `skipStep` (advances without marking complete), step-index boundary (last step → lesson complete)
- [X] T053 [P] [US2] Write component tests for LessonPlayer in `tests/component/LessonPlayer.test.tsx` — renders step instruction text, renders correct input type per `StepType`, disables Next button before answer submitted, shows feedback message after submission, shows completion screen after final step
- [X] T054 [P] [US2] Write E2E tests for US2 in `tests/e2e/us2-guided-lesson.spec.ts` — Playwright: (1) navigate to `/lessons`, click KVL lesson → loads `/lessons/kvl`; (2) submit correct answer → feedback "正確" appears; (3) submit wrong answer → hint appears (not the answer); (4) complete all steps → completion indicator visible; (5) navigate to `/` and back to `/lessons/kvl` → progress preserved, step index correct

### Lesson Data

- [X] T055 [US2] Create all 10 lesson JSON files in `src/data/lessons/` — files: `ohms-law.json`, `kvl.json`, `kcl.json`, `series-circuit.json`, `parallel-circuit.json`, `thevenin.json`, `norton.json`, `nodal-analysis.json`, `mesh-analysis.json`, `superposition.json`; each must conform to `Lesson` interface from `src/types/circuit.ts`; each with 3–8 `LessonStep` objects covering the topic with `instruction`, `type`, `expectedAnswer`, `tolerance`, `hint`, `explanation`; at least 2 steps of type `enter-value` per lesson (for numeric answer testing)

### Store Implementation

- [X] T056 [US2] Implement `src/stores/lessonStore.ts` — Zustand store: `currentLesson: Lesson | null`, `currentStepIndex: number`, `feedback: StepFeedback | null`; `loadLesson(lessonId)` imports JSON from `src/data/lessons/${lessonId}.json`, calls `progressStore.startLesson(lessonId)`, restores `currentStepIndex` from `progressStore.getRecordFor('lesson', lessonId).completedSteps`; `submitAnswer(answer)` evaluates against `step.expectedAnswer` with `step.tolerance`% for numeric types, calls `progressStore.completeStep` on correct, sets `feedback`; `skipStep()` advances index without recording completion

### Lesson UI Components

- [X] T057 [US2] Create `src/components/lessons/LessonCatalog.tsx` — grid of lesson cards, each showing `title`, `difficulty` badge, `estimatedMinutes`, prerequisite warning if `prerequisiteIds` not yet completed; reads completion status from `progressStore.records`; clicking a card navigates to `/lessons/:lessonId`
- [X] T058 [US2] Create `src/components/lessons/StepFeedback.tsx` — renders `StepFeedback` object from `lessonStore`; green banner for `isCorrect`, yellow for `isPartiallyCorrect`, red for wrong; shows `hint` when incorrect; shows `explanation` after correct; animates in with CSS transition
- [X] T059 [US2] Create `src/components/lessons/LessonPlayer.tsx` — master lesson component: progress bar (`currentStepIndex / lesson.steps.length`); renders current `LessonStep` content; switches input widget by `StepType`: `enter-value` → `<input type="number">`, `label-node` → text input, `place-component` / `connect-wire` → embedded `<CircuitCanvas>` (read/write mode) with `prebuiltCircuit` pre-loaded, `identify-element` → multiple-choice buttons; Submit / Skip buttons; renders `<StepFeedback>`; completion screen when all steps done (score, replay button)
- [X] T060 [P] [US2] Create `src/components/lessons/LessonProgressBar.tsx` — horizontal bar showing completed vs total steps; colour-coded: grey = not started, green = completed, blue = current; updates reactively from `lessonStore.currentStepIndex`

### Page Assembly

- [X] T061 [US2] Wire up `src/pages/LessonsPage.tsx` — render `<LessonCatalog>`; call `progressStore.loadProgress(studentId)` on mount (get `studentId` from `localStorage.getItem('studentId') ?? 'anonymous'`)
- [X] T062 [US2] Wire up `src/pages/LessonPlayerPage.tsx` — read `:lessonId` from URL params; call `lessonStore.loadLesson(lessonId)` on mount; render `<LessonPlayer>`; handle unknown lessonId → redirect to `/lessons`

**Checkpoint**: `npm run test` + `npx playwright test tests/e2e/us2-guided-lesson.spec.ts` — all US2 tests pass. Manually navigate through a complete lesson and verify progress survives browser refresh (SC-006). ✅

---

## Phase 5: User Story 3 — Review Learning History and Progress (Priority: P3)

**Goal**: A student visits the progress dashboard and sees all completed lessons and exercises with scores, completion dates, and topic coverage. An onboarding prompt is shown when no progress exists. Layout is fully responsive on mobile.

**Independent Test**: Complete two lessons, navigate to `/dashboard`, verify both lessons are listed with correct scores and dates. Then open a fresh browser session with no progress and verify the onboarding prompt is shown.

### Tests for User Story 3 (TDD — Write First, Must FAIL)

- [X] T063 [US3] Write component tests for ProgressDashboard in `tests/component/ProgressDashboard.test.tsx` — renders lesson list with completion status; renders exercise list with scores; renders onboarding prompt when `records.length === 0`; mobile layout: no horizontal overflow at 375 px width (using `ResizeObserver` mock)
- [X] T064 [P] [US3] Write E2E tests for US3 in `tests/e2e/us3-progress-dashboard.spec.ts` — Playwright: (1) complete two lessons via US2 flow → navigate to `/dashboard` → verify lesson titles + scores visible; (2) clear localStorage → reload `/dashboard` → verify onboarding CTA "開始第一堂課" links to `/lessons`; (3) 375 px mobile viewport → all text readable, no horizontal scroll

### Dashboard Components

- [X] T065 [US3] Create `src/components/dashboard/LessonProgressCard.tsx` — card showing `lesson.title`, `record.status` badge (completed/in-progress/not-started), score percentage, `record.completedAt` formatted as locale date, progress bar (completedSteps / total steps); clicking navigates to `/lessons/:lessonId`
- [X] T066 [P] [US3] Create `src/components/dashboard/ExerciseProgressCard.tsx` — card showing exercise title, topic badge, attempt count, score, correct/incorrect icon; clicking navigates to `/exercises/:exerciseId`
- [X] T067 [P] [US3] Create `src/components/dashboard/TopicCoverageChart.tsx` — simple CSS bar chart (no external chart library) showing how many lessons per `LessonTopic` have been completed; labels in Traditional Chinese per `LessonTopic` enum; renders as horizontal bars; height auto-sizes to number of topics
- [X] T068 [US3] Create `src/components/dashboard/OnboardingPrompt.tsx` — displayed when `progressStore.records.length === 0`; welcoming message with "開始第一堂課" button → navigates to `/lessons`; includes a brief visual summary of available topics

### Page Assembly

- [X] T069 [US3] Assemble `src/pages/DashboardPage.tsx` — call `progressStore.loadProgress(studentId)` on mount; conditionally render `<OnboardingPrompt>` or a two-column grid of `<LessonProgressCard>` items (all 10 lessons) + `<ExerciseProgressCard>` items + `<TopicCoverageChart>`; single-column on mobile via CSS Grid

**Checkpoint**: `npm run test` + `npx playwright test tests/e2e/us3-progress-dashboard.spec.ts` — all US3 tests pass. Verify dashboard data survives browser refresh. ✅

---

## Phase 6: User Story 4 — Practice with Circuit Analysis Exercises (Priority: P4)

**Goal**: A student selects an unguided exercise, reads the question, uses the interactive canvas to annotate or explore, submits a numeric answer, and receives scored feedback. After `maxAttempts` tries the solution walkthrough is revealed. Annotations persist for the exercise session.

**Independent Test**: Open an exercise, submit the correct answer (within ±2% tolerance), verify score recorded as 100. Re-attempt with wrong answer 3 times, verify solution walkthrough is shown automatically.

### Tests for User Story 4 (TDD — Write First, Must FAIL)

- [X] T070 [US4] Write component tests for ExercisePlayer in `tests/component/ExercisePlayer.test.tsx` — renders question text and circuit canvas (read-only topology); accept input within ±2% tolerance → marks correct; wrong answer increments attempt count; after `maxAttempts` reached → solution walkthrough sections visible; canvas annotations persisted within session
- [X] T071 [P] [US4] Write E2E tests for US4 in `tests/e2e/us4-exercise.spec.ts` — Playwright: (1) navigate to `/exercises` → list visible; (2) open exercise → submit correct answer → score badge shows 100; (3) submit wrong answer 3× → solution walkthrough appears with all sections; (4) canvas annotation: place a component → visible throughout exercise session without affecting stored circuit

### Exercise Data

- [X] T072 [US4] Create 10+ exercise JSON files in `src/data/exercises/` — at least one per `LessonTopic`; each must conform to `Exercise` interface; include `circuit` (pre-built, non-empty), `correctAnswer`, `answerUnit`, `tolerancePercent: 2`, `maxAttempts: 3`, `solutionWalkthrough: string[]` (3–6 step strings); sample exercise: "求下列串聯電路的等效電阻" with two resistors in series

### Exercise UI Components

- [X] T073 [US4] Create `src/components/exercises/ExerciseList.tsx` — grid of exercise cards sorted by topic then difficulty; each card shows title, topic badge, difficulty badge, attempt count from `progressStore`; clicking navigates to `/exercises/:exerciseId`
- [X] T074 [US4] Create `src/components/exercises/ExercisePlayer.tsx` — renders `exercise.questionText`, embeds `<CircuitCanvas>` in read-only topology mode (student may add annotation components but cannot modify pre-built wires/components); `<input type="number">` with unit label; Submit button; shows `AttemptCounter` (attempt N of `maxAttempts`); on correct → green success banner, records `progressStore.recordExerciseAttempt(id, true)`; on wrong → red banner with attempt count; after `maxAttempts` → auto-reveal `<SolutionWalkthrough>`; on every attempt → `progressStore.recordExerciseAttempt(id, false)` for incorrect
- [X] T075 [P] [US4] Create `src/components/exercises/SolutionWalkthrough.tsx` — renders `exercise.solutionWalkthrough` array as numbered steps in an expandable accordion; each step in a `<section>` with step number and text; renders LaTeX-like inline math expressions using plain `<em>` tags (no MathJax dependency; math rendered as readable text: e.g., "I = V ÷ R = 5 V ÷ 10 Ω = 0.5 A")

### Page Assembly

- [X] T076 [US4] Wire up `src/pages/ExercisesPage.tsx` — call `progressStore.loadProgress(studentId)` on mount; render `<ExerciseList>` with all exercises imported from `src/data/exercises/`
- [X] T077 [US4] Wire up `src/pages/ExercisePlayerPage.tsx` — read `:exerciseId` from URL; load matching exercise from data; render `<ExercisePlayer>`; handle unknown ID → redirect to `/exercises`

**Checkpoint**: `npm run test` + `npx playwright test tests/e2e/us4-exercise.spec.ts` — all US4 tests pass. Manually verify: correct answer within tolerance → 100 score; 3 wrong answers → walkthrough revealed. ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsiveness refinement, accessibility, performance, edge-case hardening, and deployment verification across all user stories.

- [X] T078 [P] Audit and fix responsive layout — run Playwright at 320 px, 375 px, 768 px, 1280 px, 2560 px on all pages; fix overflow/truncation in `src/index.css`, `src/pages/HomePage.tsx`, `src/pages/LessonsPage.tsx`, `src/pages/DashboardPage.tsx` (SC-004, FR-013)
- [X] T079 [P] Add accessibility attributes — add `aria-label`, `role`, `tabIndex` to all interactive elements in `src/components/toolbar/ComponentPalette.tsx`, `src/components/toolbar/ActionBar.tsx`, `src/components/canvas/CircuitCanvas.tsx`; verify with `toHaveAccessibleName` in `tests/component/` (FR-014)
- [X] T080 Harden edge cases across `src/components/simulation/SimulationErrorBanner.tsx`, `src/stores/progressStore.ts`, `src/components/toolbar/ComponentPalette.tsx`, `src/utils/siFormat.ts`, `src/components/layout/MinScreenWarning.tsx` — verify: (1) short-circuit → banner, no Infinity; (2) offline → localStorage preserves progress + "已儲存於本機" toast; (3) 50-component cap enforced; (4) SI prefixes correct for all ranges; (5) < 320 px → warning overlay shown (SC-007, FR-004, FR-015)
- [X] T081 [P] Add debounce and memoization in `src/hooks/useSimulationEffect.ts` and `src/components/simulation/SimulationPanel.tsx` — memoize circuit topology hash with `useMemo`; memoize `formatSI` outputs; verify end-to-end update latency ≤ 1 s on throttled CPU in Playwright performance trace (SC-002)
- [X] T082 [P] Verify and optimize bundle size — run `npx vite-bundle-visualizer` (or `rollup-plugin-visualizer`); confirm total gzipped JS ≤ 250 KB; code-split lesson JSON files with `import()` lazy loading so initial bundle excludes lesson data
- [X] T083 [P] Add `src/components/canvas/shapes/index.ts` barrel export; add `src/solver/index.ts` barrel export; add `src/stores/index.ts` barrel export; clean up all unused imports flagged by ESLint
- [X] T084 [P] Write integration smoke test in `tests/component/AppRoutes.test.tsx` — render `<App>` with `MemoryRouter`; navigate to each route; verify correct page component renders without crashing
- [X] T085 Run complete Playwright E2E suite against `npm run preview` (production build) — `npm run build && npm run preview` then `npx playwright test`; fix any build-specific failures (base path, asset URLs, router basename)
- [X] T086 Validate against `quickstart.md` end-to-end — follow every command in quickstart.md exactly from a clean `node_modules` state: `npm install`, `npm run dev`, `npm run test`, `npx playwright test`, `npm run build`, `npm run preview`; confirm all commands succeed and update quickstart.md if any steps have changed

**Final Checkpoint**: All 86 tasks checked ✅. `npm run test:coverage` shows ≥ 80% line coverage on `src/solver/` and `src/stores/`. `npm run build` produces `dist/` with no TypeScript errors. `npx playwright test` passes all 4 US1–US4 E2E suites across Chromium, Firefox, and WebKit. ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup          → No dependencies — start immediately
Phase 2: Foundational   → Requires Phase 1 complete — BLOCKS all user stories
Phase 3: US1 (P1)       → Requires Phase 2 complete
Phase 4: US2 (P2)       → Requires Phase 2 complete (independent of US1)
Phase 5: US3 (P3)       → Requires Phase 2 + progressStore (T024) — independent of US1/US2
Phase 6: US4 (P4)       → Requires Phase 2 + progressStore (T024) — independent of US1/US2
Phase 7: Polish          → Requires all desired user stories complete
```

### User Story Internal Dependencies

```
US1: T030–T033 (tests) → T034–T036 (solver) → T037–T044 (canvas/toolbar) → T045–T051 (simulation+assembly)
US2: T052–T054 (tests) → T055 (data) → T056 (store) → T057–T060 (UI) → T061–T062 (pages)
US3: T063–T064 (tests) → T065–T068 (components) → T069 (page)
US4: T070–T071 (tests) → T072 (data) → T073–T075 (UI) → T076–T077 (pages)
```

### Critical Path

```
T001 → T002 → T012 → T018/T019/T022 → T020/T021/T023/T024 → T030 → T034/T035 → T042 → T051
```

### Parallel Opportunities Per Story

- **US1**: T030, T031, T032, T033 can all be written in parallel (different test files)
- **US1**: T037 (shapes), T038 (grid), T039 (wire layer), T040 (component layer), T041 (selection) can be built in parallel once T034/T035 pass
- **US1**: T043, T044, T045, T046, T047 can be built in parallel
- **US2**: T052, T053, T054 written in parallel; T057, T058, T059, T060 built in parallel
- **US3**: T065, T066, T067, T068 built in parallel
- **US4**: T073, T074, T075 built in parallel
- **Polish**: T078–T086 mostly independent — all marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Step 1 — write all US1 tests in parallel (different files):
Task: "tests/unit/solver/mna.test.ts"         # T030
Task: "tests/unit/solver/topology.test.ts"    # T031
Task: "tests/component/CircuitCanvas.test.tsx" # T032
Task: "tests/e2e/us1-simulate-circuit.spec.ts" # T033

# Step 2 — implement solver (sequential: topology needed by mna):
Task: "src/solver/topology.ts"  # T034 first
Task: "src/solver/mna.ts"       # T035 (imports topology)
Task: "src/solver/simplify.ts"  # T036 [P] alongside T035

# Step 3 — build canvas layers in parallel (all different files):
Task: "src/components/canvas/shapes/"         # T037
Task: "src/components/canvas/GridLayer.tsx"   # T038
Task: "src/components/canvas/WireLayer.tsx"   # T039
Task: "src/components/canvas/ComponentLayer.tsx" # T040
Task: "src/components/canvas/SelectionOverlay.tsx" # T041
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1**: Setup (T001–T011) — ~1 day
2. Complete **Phase 2**: Foundational (T012–T029) — ~2 days
3. Complete **Phase 3**: US1 (T030–T051) — ~3–4 days
4. **STOP and VALIDATE**: Test US1 end-to-end independently
5. Deploy preview to GitHub Pages and demo the circuit simulator

### Incremental Delivery

```
Week 1: Phase 1 + Phase 2 → Foundation ready
Week 2: Phase 3 (US1)     → Circuit simulation MVP ← DEPLOY HERE
Week 3: Phase 4 (US2)     → Guided lessons added ← DEMO HERE
Week 4: Phase 5 (US3)     → Progress dashboard added
Week 4: Phase 6 (US4)     → Exercise practice added ← FULL FEATURE
Week 5: Phase 7 (Polish)  → Responsive polish + E2E hardening ← RELEASE
```

### Parallel Team Strategy

With 2–4 developers, once Phase 2 is complete:
- **Developer A**: US1 solver + canvas (T030–T051)
- **Developer B**: US2 lessons + store (T052–T062)
- **Developer C**: US3 + US4 dashboard + exercises (T063–T077)
- All merge to branch after their story's checkpoint passes

---

## Task Count Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | T001–T011 (11 tasks) | — |
| Phase 2: Foundational | T012–T029 (18 tasks) | — |
| Phase 3: US1 (P1) | T030–T051 (22 tasks) | US1 |
| Phase 4: US2 (P2) | T052–T062 (11 tasks) | US2 |
| Phase 5: US3 (P3) | T063–T069 (7 tasks) | US3 |
| Phase 6: US4 (P4) | T070–T077 (8 tasks) | US4 |
| Phase 7: Polish | T078–T086 (9 tasks) | — |
| **Total** | **86 tasks** | |

| Story | Task Count | Test Tasks | Impl Tasks |
|-------|-----------|------------|------------|
| US1: Build & Simulate | 22 | 4 (T030–T033) | 18 (T034–T051) |
| US2: Guided Lessons | 11 | 3 (T052–T054) | 8 (T055–T062) |
| US3: Progress Dashboard | 7 | 2 (T063–T064) | 5 (T065–T069) |
| US4: Exercises | 8 | 2 (T070–T071) | 6 (T072–T077) |

**Parallel opportunities identified**: 46 tasks marked [P] across all phases  
**Suggested MVP scope**: Phase 1 + Phase 2 + Phase 3 (US1 only) = **51 tasks**

---

## Notes

- **[P]** tasks operate on different files and have no incomplete-task dependencies — safe to parallelise
- **[USn]** label maps each task to its user story for traceability and independent validation
- **TDD discipline**: always run `npm run test` after writing a test and **confirm it fails** before starting the implementation task
- Commit after each logical group (e.g., after all Phase 2 store tests written; after solver passes all unit tests)
- Pause at every **Checkpoint** to validate the story independently before proceeding
- The `historyStore` records every `circuitStore` mutation as a `CanvasAction`; ensure `execute()` is called from `circuitStore` actions, not from components directly
- `solveCircuit` is a pure function — it never modifies the circuit; keep it that way to simplify testing
- All user-visible text (error messages, lesson instructions, feedback) must be in **Traditional Chinese** (繁體中文) per Constitution I
