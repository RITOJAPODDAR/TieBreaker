import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Sliders,
  Scale,
  Sparkles,
  Info,
  Filter,
} from 'lucide-react';
import { OptionAnalysis, ProConItem, ProConCategory } from '../types/decision';
import { calculateOptionProsConsScore } from '../utils/calculations';

interface ProsConsViewProps {
  options: OptionAnalysis[];
  onUpdateOptions: (updated: OptionAnalysis[]) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Financial': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Career & Growth': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'Time & Energy': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Emotional & Wellbeing': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  'Risk & Security': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Strategic': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  options,
  onUpdateOptions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addingForOptionId, setAddingForOptionId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState<'pro' | 'con'>('pro');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<ProConCategory>('Career & Growth');
  const [newScore, setNewScore] = useState<number>(3);
  const [newExplanation, setNewExplanation] = useState('');

  const handleToggleItem = (optionId: string, itemId: string, isPro: boolean) => {
    const updated = options.map((opt) => {
      if (opt.id !== optionId) return opt;
      if (isPro) {
        return {
          ...opt,
          pros: opt.pros.map((p) =>
            p.id === itemId ? { ...p, enabled: p.enabled === false ? true : false } : p
          ),
        };
      } else {
        return {
          ...opt,
          cons: opt.cons.map((c) =>
            c.id === itemId ? { ...c, enabled: c.enabled === false ? true : false } : c
          ),
        };
      }
    });
    onUpdateOptions(updated);
  };

  const handleWeightChange = (
    optionId: string,
    itemId: string,
    isPro: boolean,
    weight: number
  ) => {
    const updated = options.map((opt) => {
      if (opt.id !== optionId) return opt;
      if (isPro) {
        return {
          ...opt,
          pros: opt.pros.map((p) => (p.id === itemId ? { ...p, userWeight: weight } : p)),
        };
      } else {
        return {
          ...opt,
          cons: opt.cons.map((c) => (c.id === itemId ? { ...c, userWeight: weight } : c)),
        };
      }
    });
    onUpdateOptions(updated);
  };

  const handleSaveCustomItem = (optionId: string) => {
    if (!newText.trim()) return;

    const newItem: ProConItem = {
      id: `custom-${Date.now()}`,
      text: newText.trim(),
      category: newCategory,
      score: newScore,
      explanation: newExplanation.trim() || 'Custom factor added by you.',
      userWeight: 1,
      enabled: true,
      isCustom: true,
    };

    const updated = options.map((opt) => {
      if (opt.id !== optionId) return opt;
      return {
        ...opt,
        pros: addingType === 'pro' ? [...opt.pros, newItem] : opt.pros,
        cons: addingType === 'con' ? [...opt.cons, newItem] : opt.cons,
      };
    });

    onUpdateOptions(updated);
    setNewText('');
    setNewExplanation('');
    setAddingForOptionId(null);
  };

  const categories = [
    'All',
    'Financial',
    'Career & Growth',
    'Time & Energy',
    'Emotional & Wellbeing',
    'Risk & Security',
    'Strategic',
  ];

  return (
    <div className="space-y-8">
      {/* View Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>Interactive Pros &amp; Cons Evaluation</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            AI rated impact from 1 to 5. Adjust weights or toggle points to see how the balance shifts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Options Side-by-Side or Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((opt) => {
          const scores = calculateOptionProsConsScore(opt);
          const filteredPros = opt.pros.filter(
            (p) => selectedCategory === 'All' || p.category === selectedCategory
          );
          const filteredCons = opt.cons.filter(
            (c) => selectedCategory === 'All' || c.category === selectedCategory
          );

          const isNetPositive = scores.netScore >= 0;

          return (
            <div
              key={opt.id}
              className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col"
            >
              {/* Option Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {opt.id.toUpperCase()}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1.5">
                      {opt.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium italic mt-0.5">
                      "{opt.tagline}"
                    </p>
                  </div>

                  {/* Net Score Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border font-bold text-sm sm:text-base ${
                        isNetPositive
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <span>Net:</span>
                      <span>
                        {scores.netScore > 0 ? `+${scores.netScore}` : scores.netScore}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      <span className="text-emerald-400">+{scores.prosScore}</span> vs{' '}
                      <span className="text-rose-400">-{scores.consScore}</span>
                    </div>
                  </div>
                </div>

                {/* Score Ratio Balance Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-emerald-400">
                      {scores.activeProsCount} Pros (+{scores.prosScore})
                    </span>
                    <span className="font-medium text-rose-400">
                      {scores.activeConsCount} Cons (-{scores.consScore})
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 transition-all duration-300"
                      style={{
                        width: `${
                          scores.prosScore + scores.consScore === 0
                            ? 50
                            : (scores.prosScore / (scores.prosScore + scores.consScore)) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 transition-all duration-300"
                      style={{
                        width: `${
                          scores.prosScore + scores.consScore === 0
                            ? 50
                            : (scores.consScore / (scores.prosScore + scores.consScore)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Core Tradeoff */}
                <div className="mt-3 text-xs bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-slate-300">
                  <span className="font-semibold text-amber-300">Core Tradeoff: </span>
                  {opt.keyTradeoff}
                </div>
              </div>

              {/* Lists Container */}
              <div className="p-5 space-y-6 flex-1">
                {/* PROS LIST */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Upsides &amp; Advantages</span>
                    </h4>
                    <button
                      onClick={() => {
                        setAddingForOptionId(opt.id);
                        setAddingType('pro');
                      }}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Pro</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {filteredPros.map((pro) => (
                      <ProConCard
                        key={pro.id}
                        item={pro}
                        isPro={true}
                        onToggle={() => handleToggleItem(opt.id, pro.id, true)}
                        onWeightChange={(w) => handleWeightChange(opt.id, pro.id, true, w)}
                      />
                    ))}
                    {filteredPros.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2">
                        No pros matching the current filter.
                      </p>
                    )}
                  </div>
                </div>

                {/* CONS LIST */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      <span>Downsides &amp; Friction</span>
                    </h4>
                    <button
                      onClick={() => {
                        setAddingForOptionId(opt.id);
                        setAddingType('con');
                      }}
                      className="text-[11px] text-slate-400 hover:text-rose-400 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Con</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {filteredCons.map((con) => (
                      <ProConCard
                        key={con.id}
                        item={con}
                        isPro={false}
                        onToggle={() => handleToggleItem(opt.id, con.id, false)}
                        onWeightChange={(w) => handleWeightChange(opt.id, con.id, false, w)}
                      />
                    ))}
                    {filteredCons.length === 0 && (
                      <p className="text-xs text-slate-500 italic py-2">
                        No cons matching the current filter.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Custom Item Modal / Box */}
              {addingForOptionId === opt.id && (
                <div className="p-4 bg-slate-950/90 border-t border-slate-800 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      Add Custom {addingType === 'pro' ? 'Pro' : 'Con'} to {opt.name}
                    </span>
                    <button
                      onClick={() => setAddingForOptionId(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={`e.g. ${
                      addingType === 'pro'
                        ? 'Great mentorship from founder'
                        : 'Longer commute during winter'
                    }`}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProConCategory)}
                      className="px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                    >
                      <option value="Financial">Financial</option>
                      <option value="Career & Growth">Career & Growth</option>
                      <option value="Time & Energy">Time & Energy</option>
                      <option value="Emotional & Wellbeing">Emotional & Wellbeing</option>
                      <option value="Risk & Security">Risk & Security</option>
                      <option value="Strategic">Strategic</option>
                    </select>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span>Impact (1-5):</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={newScore}
                        onChange={(e) => setNewScore(Number(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <span className="font-bold">{newScore}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveCustomItem(opt.id)}
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save {addingType === 'pro' ? 'Pro' : 'Con'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sub-component for individual card with interactive weight adjustment
const ProConCard: React.FC<{
  item: ProConItem;
  isPro: boolean;
  onToggle: () => void;
  onWeightChange: (weight: number) => void;
}> = ({ item, isPro, onToggle, onWeightChange }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const isEnabled = item.enabled !== false;
  const currentWeight = item.userWeight ?? 1;

  const catStyle = CATEGORY_COLORS[item.category] || {
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  const weights = [0.5, 1, 1.5, 2];

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        isEnabled
          ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          : 'bg-slate-950/20 border-slate-900 opacity-40 line-through'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 flex-1">
          <button
            onClick={onToggle}
            className={`mt-0.5 p-0.5 rounded transition-colors ${
              isEnabled
                ? isPro
                  ? 'text-emerald-400 hover:text-emerald-300'
                  : 'text-rose-400 hover:text-rose-300'
                : 'text-slate-600 hover:text-slate-400'
            }`}
            title={isEnabled ? 'Click to exclude' : 'Click to include'}
          >
            {isPro ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {item.category}
              </span>
              {item.isCustom && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono">
                  Custom
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
              {item.text}
            </p>
          </div>
        </div>

        {/* Score & Weight badge */}
        <div className="text-right shrink-0">
          <span
            className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
              isPro
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {isPro ? '+' : '-'}
            {Math.round(item.score * currentWeight * 10) / 10}
          </span>
        </div>
      </div>

      {/* Rationale toggle & weight selector */}
      <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          <span>{showExplanation ? 'Hide rationale' : 'Why it matters'}</span>
        </button>

        {/* Weight multiplier pills */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500">Weight:</span>
          {weights.map((w) => (
            <button
              key={w}
              onClick={() => onWeightChange(w)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                currentWeight === w
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {w}x
            </button>
          ))}
        </div>
      </div>

      {showExplanation && (
        <div className="mt-2 text-xs bg-slate-900/90 rounded-lg p-2.5 text-slate-300 border border-slate-800 animate-in fade-in duration-150">
          {item.explanation}
        </div>
      )}
    </div>
  );
};
