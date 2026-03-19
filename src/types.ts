export type Color = 'red' | 'blue' | 'green';
export type EntityType = 'button' | 'block';

export interface Entity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  color?: Color;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  color: Color;
}

export interface LevelData {
  entities: Entity[];
  initialEntities: Entity[];
  targets: Target[];
}
