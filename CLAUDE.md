# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # TypeScript type checking (tsc --noEmit)
npm run clean      # Remove dist directory
```

Requires `GEMINI_API_KEY` set in `.env.local` (see `.env.example`).

## Architecture

Single-page React puzzle game with all logic in `src/App.tsx` (~360 lines). No routing, no backend — pure client-side.

**Game concept** (from `metadata.json`): A puzzle where sliding a button moves all buttons of the same color, and clicking a paint bucket copies its color to adjacent buttons.

### Core Data Model

```ts
type EntityType = 'button' | 'block' | 'target'
type Color = 'red' | 'blue' | 'green'
type Entity = { id, type, color, x, y }
type LevelData = { entities, initialEntities, targets }
```

State is a single `useState<LevelData>` — all updates are pure functional (no mutation).

### Entity Types on the 5×5 Grid

- **Buttons** — player-controlled colored tiles; dragging one moves ALL tiles of that color simultaneously
- **Blocks** (paint buckets) — stationary; clicking one repaints orthogonally adjacent buttons to the block's color
- **Targets** — goal positions rendered as dashed outlines; win when every button matches its target color and position

### Key Mechanics

- **Slide**: Pointer drag on a button → detect direction → move all same-color buttons until blocked by grid edge or any entity
- **Paint**: Pointer tap on a block → find orthogonal neighbors that are buttons → change their color
- **Win check**: After every state change, compare button positions/colors against targets
- **Level gen** (`generateRandomLevel`): Randomly shuffles a flat list of grid positions, then places blocks, targets, and buttons

### Animations

Motion library (`motion` package) wraps entity `<div>`s with spring animations for smooth sliding. HMR can be disabled via `DISABLE_HMR=true` env var (useful in some AI Studio environments).

### Styling

Tailwind CSS v4 (via `@tailwindcss/vite` plugin). No separate config file — Tailwind is imported directly in `src/index.css`. Absolute positioning within a fixed-size grid container (`GRID_SIZE=5`, `CELL_SIZE=64px`).

### Architecture Rules
- **Decoupling**: UI must never read from or write to game state directly. UI components react to store values only; all mutations go through `Dispatch()` in `orchestrator.ts`.
- **Single Responsibility**: Each class/module does one thing. Do not add unrelated logic to existing handlers or mechanics.
- **Composition over Inheritance**: Prefer component-based patterns. Flag deep inheritance hierarchies rather than extending them.
- **Predictability**: State changes must be deterministic and centralized. All game logic flows through the orchestrator pipeline — do not introduce side-effect state mutations outside it.

### Change Discipline
- Maintain existing patterns unless explicitly instructed to refactor.
- If a requested change requires touching more than 3 files, state which files will be affected before proceeding.
- Do not modify `packages/shared/src/types.ts` or `schema.ts` without explicit instruction — changes there cascade across the monorepo.
- When adding a new Effect or Countermeasure, always update all four locations listed in the "Adding New Effects" section above. Never partially implement.
