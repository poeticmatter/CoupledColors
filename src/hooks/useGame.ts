import React, { useState } from 'react';
import { LevelData } from '../types';
import { generateRandomPuzzle } from '../lib/levelGenerator';
import { encodePuzzle, decodePuzzle } from '../lib/encoder';
import { applyPaint, applySlide } from '../lib/gameLogic';

interface GameState extends LevelData {
  code: string;
}

function getCodeFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('p');
}

function setCodeInUrl(code: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('p', code);
  history.replaceState(null, '', url.toString());
}

function releaseCapture(e: React.PointerEvent) {
  try {
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId))
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  } catch {}
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const urlCode = getCodeFromUrl();
    const level = (urlCode && decodePuzzle(urlCode)) ?? generateRandomPuzzle();
    const code = encodePuzzle(level);
    setCodeInUrl(code);
    return { code, ...level };
  });

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const { entities, targets, code } = gameState;

  const isWin = targets.every(t =>
    entities.some(e => e.type === 'button' && e.color === t.color && e.x === t.x && e.y === t.y),
  );

  const updateEntities = (fn: (prev: typeof entities) => typeof entities) =>
    setGameState(prev => ({ ...prev, entities: fn(prev.entities) }));

  const handlePointerDown = (e: React.PointerEvent, id: number) => {
    if (isWin) return;
    setDragStart({ x: e.clientX, y: e.clientY });
    setDraggedId(id);
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
  };

  const handlePointerUp = (e: React.PointerEvent, id: number) => {
    if (!dragStart || draggedId !== id) {
      releaseCapture(e);
      return;
    }

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      updateEntities(prev => applyPaint(prev, id));
    } else if (Math.abs(dx) > Math.abs(dy)) {
      updateEntities(prev => applySlide(prev, id, dx > 0 ? 1 : -1, 0));
    } else {
      updateEntities(prev => applySlide(prev, id, 0, dy > 0 ? 1 : -1));
    }

    setDragStart(null);
    setDraggedId(null);
    releaseCapture(e);
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    setDragStart(null);
    setDraggedId(null);
    releaseCapture(e);
  };

  const resetLevel = () =>
    setGameState(prev => ({ ...prev, entities: prev.initialEntities }));

  const newLevel = () => {
    const level = generateRandomPuzzle();
    const code = encodePuzzle(level);
    setCodeInUrl(code);
    setGameState({ code, ...level });
  };

  return {
    entities,
    targets,
    code,
    isWin,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    resetLevel,
    newLevel,
  };
}
