# Power Broker — AI Agent Instructions

## Project Overview
Political campaign simulation game. Player manages Steve Gonzalez's Republican campaign against incumbent Susie Lee in NV-03.

## Tech Stack
- React 19 + TypeScript (strict) + Vite 6
- Zustand (state) + Immer + IndexedDB persist
- Tailwind CSS 4, Lucide React icons, Recharts
- Vitest + React Testing Library

## Key Conventions

### Code Style
- Use `@/` path alias for all imports
- Engine files (`src/engine/`) must be pure TypeScript — NO React imports
- Components use named exports, one component per file
- Use Tailwind classes only — no CSS modules or styled-components
- All game state flows through the Zustand store

### File Organization
- `src/types/` — TypeScript interfaces only, no logic
- `src/engine/` — Pure game simulation logic, no UI
- `src/store/` — Zustand slices bridge engine and UI
- `src/components/` — Reusable UI components
- `src/screens/` — Full-page views (route targets)
- `src/data/` — Static JSON game data
- `tests/` — Mirrors src structure

### Mobile-First Design
- Design for 375px width minimum
- Touch targets minimum 48x48px
- Use bottom-sheet modals (slide up from bottom)
- Bottom navigation with 5 tabs
- Dark theme with navy color palette

### Game Architecture
- 26 turns (weeks), 5 AP per turn
- Turn loop: briefing → events → actions → ads → resolution
- All game math in engine files, using BalanceConstants
- SeededRandom for reproducible randomness
- State persists to IndexedDB via Zustand middleware

### Testing
- Test engine logic thoroughly (pure functions)
- Test store slices for state transitions
- Component tests for critical user flows
- Run: `npm test`

### Building
- `npm run dev` — development server
- `npm run build` — production build (must pass TypeScript check)
- `npm test` — run all tests
