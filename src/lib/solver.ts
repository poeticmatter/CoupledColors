import { Color, Entity, LevelData, Target } from '../types';
import { GRID_SIZE } from '../constants';

export type Move =
  | { type: 'slide'; color: Color; dx: number; dy: number }
  | { type: 'paint'; blockId: number };

export type SolveResult =
  | { status: 'solved'; moves: Move[] }
  | { status: 'unsolvable' }
  | { status: 'timeout' };

// ─── Internal types ───────────────────────────────────────────────────────────

type Btn = { x: number; y: number; color: Color };

const COLORS: Color[] = ['red', 'blue', 'green'];

const DIRS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
] as const;

const COLOR_CODE: Record<Color, number> = { red: 1, blue: 2, green: 3 };

// ─── State encoding ───────────────────────────────────────────────────────────

/**
 * Encode the button layout as a 25-character string (one char per grid cell).
 * Char code: 0 = empty, 1 = red button, 2 = blue button, 3 = green button.
 * Blocks are fixed and not part of the state.
 */
function stateKey(buttons: Btn[]): string {
  const cells = new Uint8Array(GRID_SIZE * GRID_SIZE);
  for (const b of buttons) cells[b.y * GRID_SIZE + b.x] = COLOR_CODE[b.color];
  return String.fromCharCode(...cells);
}

// ─── Move application ─────────────────────────────────────────────────────────

function applySlide(buttons: Btn[], blocks: Entity[], color: Color, dx: number, dy: number): Btn[] {
  const group = buttons.filter(b => b.color === color);

  for (const b of group) {
    const nx = b.x + dx;
    const ny = b.y + dy;
    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return buttons;
    if (blocks.some(bl => bl.x === nx && bl.y === ny)) return buttons;
    if (buttons.some(ob => ob.color !== color && ob.x === nx && ob.y === ny)) return buttons;
  }

  return buttons.map(b => b.color === color ? { ...b, x: b.x + dx, y: b.y + dy } : b);
}

function applyPaint(buttons: Btn[], block: Entity): Btn[] {
  const blockColor = block.color as Color;
  let changed = false;
  const next = buttons.map(b => {
    const adjacent =
      (Math.abs(b.x - block.x) === 1 && b.y === block.y) ||
      (Math.abs(b.y - block.y) === 1 && b.x === block.x);
    if (adjacent && b.color !== blockColor) {
      changed = true;
      return { ...b, color: blockColor };
    }
    return b;
  });
  return changed ? next : buttons;
}

// ─── Goal check ───────────────────────────────────────────────────────────────

function isGoal(buttons: Btn[], targets: Target[]): boolean {
  return targets.every(t =>
    buttons.some(b => b.x === t.x && b.y === t.y && b.color === t.color),
  );
}

// ─── Path reconstruction ──────────────────────────────────────────────────────

type ParentEntry = { fromKey: string; move: Move } | null;

function reconstructPath(parent: Map<string, ParentEntry>, goalKey: string): Move[] {
  const moves: Move[] = [];
  let key = goalKey;
  while (true) {
    const p = parent.get(key)!;
    if (p === null) break;
    moves.unshift(p.move);
    key = p.fromKey;
  }
  return moves;
}

// ─── BFS solver ───────────────────────────────────────────────────────────────

/**
 * Find the shortest solution using BFS.
 *
 * State space upper bound: C(22,6) × 3^6 ≈ 54M states (with variable color
 * distribution after paints). In practice, reachable states are far fewer.
 *
 * Returns 'timeout' if maxStates is exceeded — the puzzle may still be
 * solvable but requires more search.
 */
export function solve(level: LevelData, maxStates = 500_000): SolveResult {
  const blocks = level.entities.filter(e => e.type === 'block');
  const { targets } = level;

  const initial: Btn[] = level.initialEntities
    .filter(e => e.type === 'button')
    .map(e => ({ x: e.x, y: e.y, color: e.color as Color }));

  if (isGoal(initial, targets)) return { status: 'solved', moves: [] };

  const initialKey = stateKey(initial);
  const parent = new Map<string, ParentEntry>([[initialKey, null]]);
  const queue: { buttons: Btn[]; key: string }[] = [{ buttons: initial, key: initialKey }];
  let head = 0; // index pointer avoids O(n) shift()

  while (head < queue.length) {
    if (parent.size > maxStates) return { status: 'timeout' };

    const { buttons, key } = queue[head++];

    // Try all slides
    for (const color of COLORS) {
      for (const { dx, dy } of DIRS) {
        const next = applySlide(buttons, blocks, color, dx, dy);
        if (next === buttons) continue; // no-op move
        const nextKey = stateKey(next);
        if (!parent.has(nextKey)) {
          parent.set(nextKey, { fromKey: key, move: { type: 'slide', color, dx, dy } });
          if (isGoal(next, targets)) return { status: 'solved', moves: reconstructPath(parent, nextKey) };
          queue.push({ buttons: next, key: nextKey });
        }
      }
    }

    // Try all paints
    for (const block of blocks) {
      const next = applyPaint(buttons, block);
      if (next === buttons) continue; // no-op move
      const nextKey = stateKey(next);
      if (!parent.has(nextKey)) {
        parent.set(nextKey, { fromKey: key, move: { type: 'paint', blockId: block.id } });
        if (isGoal(next, targets)) return { status: 'solved', moves: reconstructPath(parent, nextKey) };
        queue.push({ buttons: next, key: nextKey });
      }
    }
  }

  return { status: 'unsolvable' };
}
