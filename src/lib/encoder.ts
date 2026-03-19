import { Color, Entity, LevelData } from '../types';
import { GRID_SIZE } from '../constants';

const COLORS: Color[] = ['red', 'blue', 'green'];
const N_CELLS = GRID_SIZE * GRID_SIZE; // 25

/**
 * All 15 pieces draw from a single shared pool of 25 cells, in order:
 *
 *   3 blocks  (1 each): pick 1 of 25, 24, 23
 *   6 targets (2 each): pick 2 of 22 → C(22,2)=231, then 20→190, then 18→153
 *   6 buttons (2 each): pick 2 of 16 → C(16,2)=120, then 14→91,  then 12→66
 *
 * This enforces: no two pieces share a cell, and — crucially — targets can
 * never land on block cells (buttons can't reach block cells, so a target
 * there would be unsolvable).
 *
 * Product = 66,788,651,049,120,000 ≈ 6.68×10¹⁶ (all valid puzzle states)
 * Max encoded string: 11 base-36 characters.
 */
const GROUP_SIZES = [
  25n, 24n, 23n,     // blocks
  231n, 190n, 153n,  // target pairs
  120n, 91n, 66n,    // button pairs
];

function cellOf(e: { x: number; y: number }): number {
  return e.y * GRID_SIZE + e.x;
}

function posOf(cell: number): { x: number; y: number } {
  return { x: cell % GRID_SIZE, y: Math.floor(cell / GRID_SIZE) };
}

/** Lexicographic rank of unordered pair (i, j) where i < j, chosen from n items. */
function combRank(i: number, j: number, n: number): number {
  return i * (n - 1) - (i * (i - 1)) / 2 + (j - i - 1);
}

/** Inverse: recover (i, j) from its lexicographic rank among pairs of n items. */
function combUnrank(rank: number, n: number): [number, number] {
  let i = 0;
  while (rank >= n - 1 - i) {
    rank -= n - 1 - i;
    i++;
  }
  return [i, i + 1 + rank];
}

/** Parse a base-36 string to BigInt without precision loss. */
function parseBigInt36(s: string): bigint {
  let n = 0n;
  for (const ch of s) n = n * 36n + BigInt(parseInt(ch, 36));
  return n;
}

/**
 * Encode a puzzle layout to a short string (≤ 11 base-36 chars).
 * Every valid puzzle maps to exactly one string.
 */
export function encodePuzzle(level: LevelData): string {
  const available: number[] = Array.from({ length: N_CELLS }, (_, i) => i);
  const ranks: bigint[] = [];

  // Blocks
  for (const color of COLORS) {
    const block = level.entities.find(e => e.type === 'block' && e.color === color)!;
    const idx = available.indexOf(cellOf(block));
    ranks.push(BigInt(idx));
    available.splice(idx, 1);
  }

  // Target pairs
  for (const color of COLORS) {
    const cells = level.targets
      .filter(t => t.color === color)
      .map(cellOf)
      .sort((a, b) => a - b);
    const i = available.indexOf(cells[0]);
    const j = available.indexOf(cells[1]);
    ranks.push(BigInt(combRank(i, j, available.length)));
    available.splice(j, 1);
    available.splice(i, 1);
  }

  // Button pairs
  for (const color of COLORS) {
    const cells = level.entities
      .filter(e => e.type === 'button' && e.color === color)
      .map(cellOf)
      .sort((a, b) => a - b);
    const i = available.indexOf(cells[0]);
    const j = available.indexOf(cells[1]);
    ranks.push(BigInt(combRank(i, j, available.length)));
    available.splice(j, 1);
    available.splice(i, 1);
  }

  let N = 0n;
  for (let k = 0; k < ranks.length; k++) N = N * GROUP_SIZES[k] + ranks[k];
  return N.toString(36);
}

/**
 * Decode a puzzle code back to a LevelData.
 * Returns null if the string is invalid or out of range.
 */
export function decodePuzzle(code: string): LevelData | null {
  try {
    let N = parseBigInt36(code);

    const ranks: number[] = new Array(GROUP_SIZES.length);
    for (let k = GROUP_SIZES.length - 1; k >= 0; k--) {
      ranks[k] = Number(N % GROUP_SIZES[k]);
      N = N / GROUP_SIZES[k];
    }
    if (N !== 0n) return null;

    const available: number[] = Array.from({ length: N_CELLS }, (_, i) => i);
    const entities: Entity[] = [];
    const targets = [];
    let id = 1;

    // Blocks
    for (let ci = 0; ci < 3; ci++) {
      const idx = ranks[ci];
      if (idx >= available.length) return null;
      const cell = available[idx];
      entities.push({ id: id++, type: 'block' as const, color: COLORS[ci], ...posOf(cell) });
      available.splice(idx, 1);
    }

    // Target pairs
    for (let ci = 0; ci < 3; ci++) {
      const [i, j] = combUnrank(ranks[3 + ci], available.length);
      if (j >= available.length) return null;
      targets.push({ id: id++, color: COLORS[ci], ...posOf(available[i]) });
      targets.push({ id: id++, color: COLORS[ci], ...posOf(available[j]) });
      available.splice(j, 1);
      available.splice(i, 1);
    }

    // Button pairs
    for (let ci = 0; ci < 3; ci++) {
      const [i, j] = combUnrank(ranks[6 + ci], available.length);
      if (j >= available.length) return null;
      entities.push({ id: id++, type: 'button' as const, color: COLORS[ci], ...posOf(available[i]) });
      entities.push({ id: id++, type: 'button' as const, color: COLORS[ci], ...posOf(available[j]) });
      available.splice(j, 1);
      available.splice(i, 1);
    }

    return { entities, initialEntities: entities.map(e => ({ ...e })), targets };
  } catch {
    return null;
  }
}
