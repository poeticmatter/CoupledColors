import { motion } from 'motion/react';

interface Props {
  onRetry: () => void;
  onNext: () => void;
}

export function WinOverlay({ onRetry, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm"
    >
      <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">You Win!</h2>
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-full hover:bg-neutral-700 transition-transform active:scale-95"
        >
          Retry
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-transform active:scale-95"
        >
          Next Level
        </button>
      </div>
    </motion.div>
  );
}
