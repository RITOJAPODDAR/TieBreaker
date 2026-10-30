import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  HelpCircle,
  ArrowRight,
  Lightbulb,
  Sliders,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { DecisionTemplate } from '../types/decision';

interface DecisionFormProps {
  onSubmit: (formData: {
    title: string;
    options: string[];
    context: string;
    userPriorities: string;
  }) => void;
  isLoading: boolean;
  initialTemplate?: DecisionTemplate | null;
}

const COMMON_PRIORITY_TAGS = [
  '💰 High Financial Upside',
  '🧘 Mental Health & Balance',
  '🚀 Career Compounding',
  '🛡️ Stability & Low Risk',
  '🗽 Creative Freedom',
  '⏳ Short-term Comfort',
  '📈 High Scalability',
  '👨‍👩‍👧 Proximity to Loved Ones',
];

export const DecisionForm: React.FC<DecisionFormProps> = ({
  onSubmit,
  isLoading,
  initialTemplate,
}) => {
  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [options, setOptions] = useState<string[]>(
    initialTemplate?.options || ['Option A', 'Option B']
  );
  const [context, setContext] = useState(initialTemplate?.context || '');
  const [userPriorities, setUserPriorities] = useState(
    initialTemplate?.userPriorities || ''
  );
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(initialTemplate?.context || initialTemplate?.userPriorities)
  );
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Sync if initialTemplate changes
  React.useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.title);
      setOptions(initialTemplate.options);
      setContext(initialTemplate.context);
      setUserPriorities(initialTemplate.userPriorities);
      setShowAdvanced(true);
    }
  }, [initialTemplate]);

  // Loading animation step cyclist
  React.useEffect(() => {
    if (!isLoading) return;
    const steps = [
      'Deconstructing decision variables...',
      'Synthesizing multi-option Pros & Cons...',
      'Computing weighted Comparison Matrix...',
      'Conducting strategic SWOT breakdown...',
      'Stress-testing with Devil’s Advocate...',
      'Formulating definitive Tiebreaker Verdict...',
    ];
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % steps.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, `Option ${String.fromCharCode(65 + options.length)}`]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleToggleTag = (tag: string) => {
    if (userPriorities.includes(tag)) {
      setUserPriorities(
        userPriorities
          .replace(tag, '')
          .replace(/,\s*,/g, ',')
          .trim()
      );
    } else {
      setUserPriorities(userPriorities ? `${userPriorities}, ${tag}` : tag);
    }
  };

  const handleBrainstormOptions = async () => {
    if (!title.trim()) return;
    setIsBrainstorming(true);
    try {
      const res = await fetch('/api/brainstorm-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dilemma: title }),
      });
      const data = await res.json();
      if (data.options && Array.isArray(data.options) && data.options.length >= 2) {
        setOptions(data.options.slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) return;

    onSubmit({
      title: title.trim(),
      options: cleanOptions,
      context: context.trim(),
      userPriorities: userPriorities.trim(),
    });
  };

  const loadingSteps = [
    'Deconstructing decision variables...',
    'Synthesizing multi-option Pros & Cons...',
    'Computing weighted Comparison Matrix...',
    'Conducting strategic SWOT breakdown...',
    'Stress-testing with Devil’s Advocate...',
    'Formulating definitive Tiebreaker Verdict...',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multidimensional Decision Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          State your dilemma.{' '}
          <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
            We’ll break the tie.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Torn between two paths? Get an objective, deep analysis through weighted
          Pros &amp; Cons, a structured comparison matrix, 4-quadrant SWOT, and a decisive recommendation.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-violet-500" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Dilemma Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-200">
                What decision are you trying to make?
              </label>
              <span className="text-xs text-slate-400">
                Be as specific as you like
              </span>
            </div>
            <div className="relative">
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                rows={2}
                placeholder="e.g. Accept seed-stage AI startup offer vs stay at Big Tech as senior engineer..."
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 text-sm sm:text-base transition-all resize-none"
                required
              />
            </div>
          </div>

          {/* Options Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <span>The Paths / Options</span>
                <span className="text-xs font-normal text-slate-400">
                  (min 2, max 5)
                </span>
              </label>

              {title.trim().length > 10 && (
                <button
                  type="button"
                  onClick={handleBrainstormOptions}
                  disabled={isBrainstorming}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  {isBrainstorming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lightbulb className="w-3.5 h-3.5" />
                  )}
                  <span>Brainstorm Options with AI</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} description...`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-800/60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add another option (Option {String.fromCharCode(65 + options.length)})</span>
              </button>
            )}
          </div>

          {/* Toggle Advanced Context & Priorities */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full py-2 text-left text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Add Context &amp; Key Priorities (Optional but recommended)</span>
              </span>
              <span className="text-xs text-indigo-400">
                {showAdvanced ? 'Hide' : 'Expand'}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4 animate-in fade-in duration-200">
                {/* Context */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Personal Context &amp; Circumstances
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={2}
                    placeholder="e.g. 29yo, have 6-mo emergency fund, no kids, partner works in tech, feeling uninspired lately..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all resize-none"
                  />
                </div>

                {/* Priorities & Quick Tags */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    What matters most to you right now?
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {COMMON_PRIORITY_TAGS.map((tag) => {
                      const selected = userPriorities.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            selected
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-medium shadow-sm shadow-indigo-500/20'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={userPriorities}
                    onChange={(e) => setUserPriorities(e.target.value)}
                    placeholder="Or type custom priorities: e.g. Maximum freedom, avoid commute, high financial upside..."
                    className="w-full px-3.5 py-2 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full py-4 px-6 rounded-xl font-bold text-white text-base sm:text-lg bg-gradient-to-r from-amber-500 via-indigo-600 to-violet-600 hover:from-amber-400 hover:via-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span className="text-amber-100 text-sm sm:text-base font-semibold">
                    {loadingSteps[loadingStepIndex]}
                  </span>
                </>
              ) : (
                <>
                  <span>Break the Tie &amp; Analyze</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
