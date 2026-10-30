import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { DecisionReport } from '../types/decision';

interface RefineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  report: DecisionReport;
  onRefineComplete: (updatedReport: DecisionReport) => void;
}

const SAMPLE_WHAT_IFS = [
  'What if my primary goal shifts to maximum mental peace and zero burnout?',
  'What if I only plan on staying in this path for 2 years instead of 5?',
  'What if compensation drops by 25% across the board?',
  'Factor in that I have young dependents and prioritize geographic stability.',
  'What if I can negotiate a middle ground or hybrid setup?',
];

export const RefineDrawer: React.FC<RefineDrawerProps> = ({
  isOpen,
  onClose,
  report,
  onRefineComplete,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async (refinementText: string) => {
    if (!refinementText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/refine-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDecision: report,
          refinementPrompt: refinementText.trim(),
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.data) {
        const updated: DecisionReport = {
          ...data.data,
          id: report.id,
          createdAt: report.createdAt,
        };
        onRefineComplete(updated);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to refine decision.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Stress-Test or Refine
              </h3>
              <p className="text-xs text-slate-400">
                Introduce new conditions, constraints, or what-ifs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Current Dilemma
            </label>
            <p className="text-sm font-bold text-slate-100 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {report.title}
            </p>
          </div>

          {/* Quick What-If Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick "What-If" Probes</span>
            </label>
            <div className="space-y-2">
              {SAMPLE_WHAT_IFS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg bg-slate-950/50 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-300 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Custom Scenario or Change
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Recalculate assuming I can only give 35 hours per week, or if the salary offer is increased by $20k..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => handleRefine(prompt)}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Re-evaluating full decision matrix...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Recalculate with New Factor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
