import { Color, Entity, LevelData, Target } from '../types';
import { GRID_SIZE } from '../constants';

const COLORS: Color[] = ['red', 'blue', 'green'];

export function generateRandomPuzzle(): LevelData {
  const positions = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
    x: i % GRID_SIZE,
    y: Math.floor(i / GRID_SIZE),
  }));

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const entities: Entity[] = [];
  const targets: Target[] = [];
  let id = 1;

  for (const color of COLORS)
    entities.push({ id: id++, type: 'block', color, ...positions.pop()! });

  for (const color of COLORS)
    for (let i = 0; i < 2; i++)
      targets.push({ id: id++, color, ...positions.pop()! });

  for (const color of COLORS)
    for (let i = 0; i < 2; i++)
      entities.push({ id: id++, type: 'button', color, ...positions.pop()! });

  return { entities, initialEntities: entities.map(e => ({ ...e })), targets };
}
