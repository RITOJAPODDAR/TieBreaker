import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  ShieldAlert,
  Clock,
  Sparkles,
  HelpCircle,
  CheckCircle,
  Lock,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TiebreakerVerdict, OptionAnalysis } from '../types/decision';

interface VerdictViewProps {
  verdict: TiebreakerVerdict;
  options: OptionAnalysis[];
  chosenOptionId?: string;
  onLockInChoice: (optionId: string) => void;
}

export const VerdictView: React.FC<VerdictViewProps> = ({
  verdict,
  options,
  chosenOptionId,
  onLockInChoice,
}) => {
  const [selectedLockOption, setSelectedLockOption] = useState<string>(
    chosenOptionId || verdict.recommendedOptionId
  );
  const [lockedSuccess, setLockedSuccess] = useState(Boolean(chosenOptionId));

  const handleTriggerConfetti = (optionId: string) => {
    setSelectedLockOption(optionId);
    onLockInChoice(optionId);
    setLockedSuccess(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6366f1', '#10b981', '#ec4899'],
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Recommendation Card */}
      <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 rounded-3xl border border-indigo-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Official Tiebreaker Verdict</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Confidence:</span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {verdict.confidenceScore}% Certainty
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Recommended Choice:{' '}
            <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-400 bg-clip-text text-transparent">
              {verdict.recommendedOptionName}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-200 font-medium italic mb-6 leading-relaxed">
            "{verdict.headlineVerdict}"
          </p>

          {/* The Critical Tipping Factor */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <Flame className="w-4 h-4" />
              <span>The Decisive Tipping Factor</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              {verdict.criticalFactor}
            </p>
          </div>

          {/* Detailed Rationale */}
          <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Why this choice edges ahead:
            </h4>
            <p className="whitespace-pre-line">{verdict.detailedRationale}</p>
          </div>
        </div>
      </div>

      {/* The 10/10/10 Rule Horizon Analysis */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            The 10/10/10 Time Horizon Test
          </h3>
          <span className="text-xs text-slate-400 font-normal">
            (How will you reflect on this decision?)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
              In 10 Minutes
            </span>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {verdict.rule101010.tenMinutes}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              In 10 Months
            </span>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {verdict.rule101010.tenMonths}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              In 10 Years
            </span>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {verdict.rule101010.tenYears}
            </p>
          </div>
        </div>
      </div>

      {/* Devil's Advocate & Risk Mitigation */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white">
            Devil’s Advocate: Stress-Testing the Winner
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
              The Chief Pitfall
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {verdict.devilsAdvocate.potentialPitfall}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              How to Hedge &amp; De-Risk
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {verdict.devilsAdvocate.hedgeStrategy}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
              When to Reconsider / Pivot
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {verdict.devilsAdvocate.whenToReconsider}
            </p>
          </div>
        </div>
      </div>

      {/* Introspective Gut Check */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 text-center">
        <div className="inline-flex p-2 rounded-full bg-indigo-500/20 text-indigo-300 mb-3">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="text-xs uppercase font-bold text-indigo-400 tracking-wider mb-1">
          The Subconscious Gut Check
        </h4>
        <p className="text-base sm:text-lg font-semibold text-white max-w-xl mx-auto italic">
          "{verdict.gutCheckQuestion}"
        </p>
      </div>

      {/* Decision Finalization / Lock In Action */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Ready to commit to your decision?</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Analysis creates clarity, but action creates momentum. Select your chosen path and make it official.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
          {options.map((opt) => {
            const isChosen = selectedLockOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleTriggerConfetti(opt.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  isChosen && lockedSuccess
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isChosen && lockedSuccess && <CheckCircle className="w-4 h-4" />}
                <span>I Choose: {opt.name}</span>
              </button>
            );
          })}
        </div>

        {lockedSuccess && (
          <div className="text-xs text-emerald-400 font-semibold animate-in fade-in pt-1">
            🎉 Decision locked! Saved to your decision history.
          </div>
        )}
      </div>
    </div>
  );
};
