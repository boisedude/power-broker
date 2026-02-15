# Power Broker — AI Agent Instructions

## Project Overview
Political campaign simulation game. Player manages Steve Gonzalez's Republican campaign against incumbent Susie Lee in NV-03.

**Live:** https://powerbrokergame.com
**Repo:** https://github.com/boisedude/power-broker

## Tech Stack
- React 19 + TypeScript (strict) + Vite 6
- Zustand (state) + Immer + IndexedDB persist
- Tailwind CSS 4, Lucide React icons, Recharts
- Vitest + Playwright (e2e)
- Hosted on Hostinger (static site, FTP deploy)

## Key Conventions

### Code Style
- Use `@/` path alias for all imports
- Engine files (`src/engine/`) must be pure TypeScript — NO React imports
- Components use named exports, one component per file
- Use Tailwind classes only — no CSS modules or styled-components
- All game state flows through the Zustand store
- Candidate name is **Gonzalez** (with a z)

### File Organization
- `src/types/` — TypeScript interfaces only, no logic
- `src/engine/` — Pure game simulation logic, no UI
- `src/store/` — Zustand slices bridge engine and UI
- `src/components/` — Reusable UI components
- `src/screens/` — Full-page views (route targets)
- `src/data/` — Static JSON game data
- `tests/` — Vitest unit tests (mirrors src structure)
- `e2e/` — Playwright end-to-end tests

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
- Event effects applied in eventSlice.ts (inside immer draft)
- Endorsement effects applied in GameEngine.ts on securing

### Testing
- Unit tests: `npm test` (Vitest, 22 tests)
- E2E tests: `npx playwright test e2e/game-flow.spec.ts` (local, 7 tests)
- Production tests: `npx playwright test e2e/production.spec.ts` (live site, 6 tests)

### Building & Deploying
- `npm run dev` — development server
- `npm run build` — production build (TypeScript check + Vite)
- SPA routing handled by `public/.htaccess` (copied to dist on build)

#### Hostinger FTP Deployment
- FTP host: `ftp://191.101.13.61`
- FTP user: `u951885034.powerbrokergame.com`
- **Important:** FTP login lands directly in `public_html/` — this IS the web root
- Upload `dist/` contents to the FTP root (which is `public_html/`), NOT to a `public_html/` subdirectory
- Do NOT use `--delete` flag with `mirror` — it can remove server-managed directories
- Deploy command:
  ```
  lftp -u 'u951885034.powerbrokergame.com,1kzEu54TaZxM@TP]' ftp://191.101.13.61 \
    -e "set ssl:verify-certificate no; mirror -R --verbose dist/ ./; quit"
  ```
