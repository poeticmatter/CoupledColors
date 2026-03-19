import { Entity } from '../types';
import { GRID_SIZE } from '../constants';

/** Click a paint bucket block → repaint orthogonally adjacent buttons to block's color. */
export function applyPaint(entities: Entity[], blockId: number): Entity[] {
  const block = entities.find(e => e.id === blockId);
  if (!block || block.type !== 'block') return entities;

  let changed = false;
  const next = entities.map(e => {
    if (e.type === 'button') {
      const adjacent =
        (Math.abs(e.x - block.x) === 1 && e.y === block.y) ||
        (Math.abs(e.y - block.y) === 1 && e.x === block.x);
      if (adjacent && e.color !== block.color) {
        changed = true;
        return { ...e, color: block.color };
      }
    }
    return e;
  });

  return changed ? next : entities;
}

/** Drag a button → slide all buttons of the same color one step in (dirX, dirY). */
export function applySlide(
  entities: Entity[],
  buttonId: number,
  dirX: number,
  dirY: number,
): Entity[] {
  const button = entities.find(e => e.id === buttonId);
  if (!button || button.type !== 'button') return entities;

  const color = button.color;
  const group = entities.filter(e => e.type === 'button' && e.color === color);

  for (const b of group) {
    const nx = b.x + dirX;
    const ny = b.y + dirY;

    if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return entities;

    const blocker = entities.find(ob => ob.x === nx && ob.y === ny);
    if (blocker && (blocker.type === 'block' || blocker.color !== color)) return entities;
  }

  return entities.map(e =>
    e.type === 'button' && e.color === color
      ? { ...e, x: e.x + dirX, y: e.y + dirY }
      : e,
  );
}
