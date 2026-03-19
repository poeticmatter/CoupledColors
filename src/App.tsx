import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';

export default function App() {
  const {
    entities,
    targets,
    code,
    isWin,
    handlePointerDown,
    handlePointerUp,
    handlePointerCancel,
    resetLevel,
    newLevel,
  } = useGame();

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white font-sans selection:bg-transparent">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Color Slide</h1>
        <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
          Drag a button to slide all buttons of that color. <br />
          Click a paint bucket to paint adjacent buttons. <br />
          Match all buttons to their target spaces to win!
        </p>
      </div>

      <GameBoard
        entities={entities}
        targets={targets}
        isWin={isWin}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onRetry={resetLevel}
        onNewLevel={newLevel}
      />

      <div className="mt-8 flex gap-4">
        <button
          onClick={resetLevel}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium text-neutral-300"
        >
          Restart Level
        </button>
        <button
          onClick={newLevel}
          className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium text-neutral-300"
        >
          Randomize Level
        </button>
      </div>

      <p className="mt-4 text-neutral-600 text-xs font-mono">
        puzzle: {code}
      </p>
    </div>
  );
}
