import React, { useState } from 'react';
import { CircleDot, RotateCcw, Sparkles, Heart } from 'lucide-react';
import { OptionAnalysis } from '../types/decision';

interface CoinFlipLabProps {
  options: OptionAnalysis[];
}

export const CoinFlipLab: React.FC<CoinFlipLabProps> = ({ options }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [flipCount, setFlipCount] = useState(0);

  const optionA = options[0]?.name || 'Option A';
  const optionB = options[1]?.name || 'Option B';

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    // Randomize result
    const outcome = Math.random() > 0.5 ? 'heads' : 'tails';

    setTimeout(() => {
      setResult(outcome);
      setIsFlipping(false);
      setFlipCount((prev) => prev + 1);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl max-w-2xl mx-auto text-center space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
          <CircleDot className="w-3.5 h-3.5" />
          <span>The Subconscious Coin Flip Experiment</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white">
          Still stuck? Let psychology do the work.
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Assign heads to Option A and tails to Option B. While the coin is in the air, notice which side your heart secretly roots for.
        </p>
      </div>

      {/* Option Keys */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-indigo-500/30 text-left">
          <span className="font-bold text-indigo-400 block mb-0.5">🪙 HEADS:</span>
          <span className="text-slate-200 font-semibold truncate block">{optionA}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 text-left">
          <span className="font-bold text-amber-400 block mb-0.5">🪙 TAILS:</span>
          <span className="text-slate-200 font-semibold truncate block">{optionB}</span>
        </div>
      </div>

      {/* Animated Coin */}
      <div className="py-4 flex justify-center items-center">
        <div
          onClick={handleFlip}
          className={`w-32 h-32 rounded-full cursor-pointer flex items-center justify-center font-black text-xl transition-all select-none shadow-2xl relative ${
            isFlipping
              ? 'animate-spin scale-110 duration-300 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 text-amber-900'
              : result === 'heads'
              ? 'bg-gradient-to-tr from-indigo-500 via-indigo-400 to-violet-600 text-white border-4 border-indigo-300/40 shadow-indigo-500/30'
              : result === 'tails'
              ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-600 text-slate-950 border-4 border-amber-300/40 shadow-amber-500/30'
              : 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 text-slate-950 border-4 border-amber-200 shadow-amber-500/20 hover:scale-105'
          }`}
        >
          {isFlipping ? (
            <span className="text-2xl font-black">?</span>
          ) : result === 'heads' ? (
            <div className="text-center">
              <span className="block text-2xl">👑</span>
              <span className="text-xs uppercase font-extrabold tracking-wider">HEADS</span>
            </div>
          ) : result === 'tails' ? (
            <div className="text-center">
              <span className="block text-2xl">🦅</span>
              <span className="text-xs uppercase font-extrabold tracking-wider">TAILS</span>
            </div>
          ) : (
            <div className="text-center">
              <span className="block text-2xl">🪙</span>
              <span className="text-xs uppercase font-extrabold tracking-wider">FLIP ME</span>
            </div>
          )}
        </div>
      </div>

      {/* Result announcement */}
      {result && !isFlipping && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 max-w-md mx-auto animate-in zoom-in-95 duration-200">
          <p className="text-xs text-slate-400 uppercase font-mono tracking-wider mb-1">
            Result Landed On:
          </p>
          <p className="text-lg font-extrabold text-white">
            {result === 'heads' ? optionA : optionB}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-amber-300/90 flex items-start gap-2 text-left">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              <strong>The Gut Test:</strong> Did seeing this result make you feel relieved, or did you immediately wish it had landed on the other one? If you felt hesitation or regret, your subconscious mind has already decided!
            </span>
          </div>
        </div>
      )}

      <div>
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
          <span>{result ? 'Flip Again' : 'Toss the Coin'}</span>
        </button>
      </div>
    </div>
  );
};
