# 2026 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-13

## Active Technologies

- **001-interactive-circuit-analysis**: TypeScript 5, React 18, Vite 5, Konva.js 10, react-konva, Zustand 5, Immer 10, Vitest 2, React Testing Library, Playwright

## Project Structure

```text
frontend/
├── src/
│   ├── components/     # React UI elements (canvas/, lesson/, exercise/, progress/)
│   ├── stores/         # Zustand state stores
│   ├── simulation/     # Custom MNA circuit simulation engine
│   ├── data/           # Static lesson and exercise JSON files
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions (persistence, etc.)
├── tests/
│   ├── unit/           # Vitest unit tests
│   ├── integration/    # React Testing Library component tests
│   └── e2e/            # Playwright end-to-end tests
└── public/

specs/                  # Feature specs, plans, and design artifacts
```

## Commands

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run test         # Run unit + integration tests (Vitest)
npm run test:e2e     # Run E2E tests (Playwright)
npm run build        # Build static site for GitHub Pages
npm run lint         # ESLint
npm run type-check   # TypeScript type checking
```

## Code Style

TypeScript 5: Follow strict mode conventions; prefer explicit types for public APIs.
React: Functional components with hooks; no class components.
Zustand stores: Use immer middleware for all state mutations.
All documentation: Traditional Chinese (繁體中文) as per project constitution.

## Recent Changes

- 001-interactive-circuit-analysis: Added interactive circuit simulation SPA with React + Konva.js + custom MNA engine

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
