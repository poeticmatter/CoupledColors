import React from 'react';
import { Entity, Target, Color } from '../types';
import { GRID_SIZE, CELL_SIZE, GAP } from '../constants';
import { EntityTile } from './Entity';
import { WinOverlay } from './WinOverlay';

interface Props {
  entities: Entity[];
  targets: Target[];
  isWin: boolean;
  onPointerDown: (e: React.PointerEvent, id: number) => void;
  onPointerUp: (e: React.PointerEvent, id: number) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onRetry: () => void;
  onNewLevel: () => void;
}

function targetClass(color: Color): string {
  switch (color) {
    case 'red': return 'border-red-500/50 bg-red-500/10';
    case 'blue': return 'border-blue-500/50 bg-blue-500/10';
    case 'green': return 'border-green-500/50 bg-green-500/10';
  }
}

const boardSize = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * GAP;

export function GameBoard({
  entities,
  targets,
  isWin,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onRetry,
  onNewLevel,
}: Props) {
  return (
    <div
      className="relative bg-neutral-800 p-2 rounded-xl shadow-2xl"
      style={{ width: boardSize, height: boardSize }}
    >
      {/* Grid cells */}
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
        const x = i % GRID_SIZE;
        const y = Math.floor(i / GRID_SIZE);
        return (
          <div
            key={i}
            className="absolute bg-neutral-700/50 rounded-lg"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: GAP + x * (CELL_SIZE + GAP),
              top: GAP + y * (CELL_SIZE + GAP),
            }}
          />
        );
      })}

      {/* Targets */}
      {targets.map(target => (
        <div
          key={`target-${target.id}`}
          className={`absolute rounded-lg border-4 border-dashed ${targetClass(target.color)}`}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: GAP + target.x * (CELL_SIZE + GAP),
            top: GAP + target.y * (CELL_SIZE + GAP),
          }}
        />
      ))}

      {/* Entities */}
      {entities.map(entity => (
        <EntityTile
          key={entity.id}
          entity={entity}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />
      ))}

      {isWin && <WinOverlay onRetry={onRetry} onNext={onNewLevel} />}
    </div>
  );
}
