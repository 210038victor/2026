# 2026 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-13

## Active Technologies

- TypeScript 5.x
- React 18
- Vite 5 (build tool)
- math.js (MNA matrix solver)
- Zustand (state management + localStorage persist)
- Vitest + React Testing Library (testing)

## Project Structure

```text
frontend/
├── src/
│   ├── engine/       (circuit solver: MNA, units)
│   ├── components/   (canvas, palette, lesson, exercise, dashboard)
│   ├── store/        (circuitStore, lessonStore, progressStore)
│   ├── data/         (static JSON lessons and exercises)
│   └── utils/        (storage.ts localStorage wrapper)
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

specs/001-interactive-circuit-analysis/
├── spec.md           (feature requirements)
├── plan.md           (this plan)
├── research.md       (technology decisions)
├── data-model.md     (TypeScript interfaces)
├── quickstart.md     (setup guide)
└── contracts/        (circuit-engine, storage-schema, ui-contracts)
```

## Commands

```bash
cd frontend
npm run dev        # start dev server at localhost:5173
npm run build      # build static site to dist/
npm run test       # run all tests
npm run preview    # preview production build
```

## Code Style

TypeScript: Follow standard conventions with strict mode enabled.
All spec/plan/doc files: Written in Traditional Chinese (繁體中文) per project constitution.
Code identifiers (variables, functions, types): English.

## Recent Changes

- 001-interactive-circuit-analysis: Responsive interactive circuit analysis learning platform (SPA, DC analysis, guided lessons, progress dashboard)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
