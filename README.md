# Power Broker

A mobile-first, turn-based political campaign simulation game. You play as the campaign manager for **Steve Gonzalez** — a former LA Galaxy goalkeeper turned real estate developer — running as the Republican challenger against **incumbent Democrat Susie Lee** in **Nevada's 3rd Congressional District (NV-03)**.

**Play now:** [powerbrokergame.com](https://powerbrokergame.com)

## Gameplay

- **26 turns** (each turn = 1 week), spanning June through Election Day
- **5 Action Points** per turn to allocate across campaign activities
- Manage fundraising, advertising, staff, endorsements, and GOTV operations
- Navigate events, debates, and opponent attacks
- Win on Election Night

### Turn Loop

1. **Morning Briefing** — Poll changes, opponent actions, fundraising totals
2. **Handle Events** — Respond to crises and opportunities (2-3 choices each)
3. **Allocate Actions** — Spend AP on: fundraise, campaign, seek endorsements, oppo research, debate prep, GOTV
4. **Set Ad Budget** — TV, digital, mailers, radio with tone selection
5. **End Turn** — Simulation runs, state updates

### Difficulty Levels

| Difficulty | Starting Cash | Starting Polls | Description |
|-----------|--------------|----------------|-------------|
| Safe Seat | $500K | 52-40 | Tutorial mode |
| Lean | $300K | 48-44 | Standard |
| Toss-Up | $200K | 45-45 | Fair fight (default) |
| Lean Away | $150K | 42-48 | Uphill battle |
| Hostile | $100K | 38-50 | Near-impossible |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Language | TypeScript (strict mode) |
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| State Management | Zustand + Immer + IndexedDB persist |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Recharts |
| Testing | Vitest + Playwright |
| Hosting | Hostinger (static) |

## Project Structure

```
src/
  engine/          # Pure TypeScript game simulation (no React)
  store/           # Zustand state management (slices + middleware)
  types/           # TypeScript interfaces
  data/            # Static JSON (district, events, staff, endorsements)
  components/      # Reusable UI components (ui/, layout/, game/, charts/)
  screens/         # Full-page route targets
  utils/           # Formatters and helpers
e2e/               # Playwright end-to-end tests
tests/             # Vitest unit tests
```

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build (TypeScript check + Vite)
npm test             # Run unit tests (Vitest)
npx playwright test  # Run e2e tests
```

## Game Systems

- **Polling** — Demographic-based with 7 voter groups, margin of error, momentum effects
- **Fundraising** — Small donors, large donors, PAC money, passive online income
- **Advertising** — TV, digital, mailers, radio with tone selection (positive, contrast, attack)
- **Staff** — 6 hireable roles (Campaign Manager, Field Director, Comms, Finance, Digital, Pollster)
- **Events** — 58 events across 5 categories (national, local NV-03, campaign, opponent, debate)
- **Opponent AI** — Susie Lee adapts strategy (establishment, aggressive, defensive) based on polls
- **GOTV** — Late-game turnout operations affecting Election Night differential
- **Election Night** — Animated vote counting with recount mechanic for close races

## District Data

Based on real NV-03 data (Cook PVI D+1, population ~839K, median income $90K). Demographics include suburban families, Latino/Hispanic, Asian American, retirees, hospitality workers, rural conservatives, and veterans.

## License

All rights reserved.
