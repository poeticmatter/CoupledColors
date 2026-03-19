import React from 'react';
import { motion } from 'motion/react';
import { PaintBucket } from 'lucide-react';
import { Entity as EntityData, Color } from '../types';
import { CELL_SIZE, GAP } from '../constants';

interface Props {
  entity: EntityData;
  onPointerDown: (e: React.PointerEvent, id: number) => void;
  onPointerUp: (e: React.PointerEvent, id: number) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
}

function entityClass(entity: EntityData): string {
  if (entity.type === 'block')
    return 'bg-neutral-800 border-4 border-neutral-700 shadow-inner cursor-pointer hover:bg-neutral-700 transition-colors';
  switch (entity.color) {
    case 'red': return 'bg-red-500 shadow-red-500/50 cursor-grab active:cursor-grabbing';
    case 'blue': return 'bg-blue-500 shadow-blue-500/50 cursor-grab active:cursor-grabbing';
    case 'green': return 'bg-green-500 shadow-green-500/50 cursor-grab active:cursor-grabbing';
    default: return 'bg-gray-500 cursor-grab active:cursor-grabbing';
  }
}

function iconColorClass(color?: Color): string {
  switch (color) {
    case 'red': return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    case 'blue': return 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]';
    case 'green': return 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]';
    default: return 'text-gray-500';
  }
}

export function EntityTile({ entity, onPointerDown, onPointerUp, onPointerCancel }: Props) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        x: GAP + entity.x * (CELL_SIZE + GAP),
        y: GAP + entity.y * (CELL_SIZE + GAP),
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`absolute rounded-lg shadow-lg touch-none ${entityClass(entity)}`}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      onPointerDown={e => onPointerDown(e, entity.id)}
      onPointerUp={e => onPointerUp(e, entity.id)}
      onPointerCancel={onPointerCancel}
    >
      {entity.type === 'button' && (
        <div className="w-full h-full rounded-lg border-t-2 border-white/20 border-b-2 border-black/20" />
      )}
      {entity.type === 'block' && (
        <div className="w-full h-full flex items-center justify-center">
          <PaintBucket className={iconColorClass(entity.color)} size={28} strokeWidth={2.5} />
        </div>
      )}
    </motion.div>
  );
}
