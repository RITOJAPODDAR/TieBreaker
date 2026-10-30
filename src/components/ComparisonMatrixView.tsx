import React, { useState } from 'react';
import {
  Table2,
  Sliders,
  Award,
  Plus,
  Info,
  HelpCircle,
} from 'lucide-react';
import { OptionAnalysis, MatrixCriterion } from '../types/decision';
import { calculateMatrixTotals } from '../utils/calculations';

interface ComparisonMatrixViewProps {
  criteria: MatrixCriterion[];
  options: OptionAnalysis[];
  onUpdateCriteria: (updatedCriteria: MatrixCriterion[]) => void;
}

export const ComparisonMatrixView: React.FC<ComparisonMatrixViewProps> = ({
  criteria,
  options,
  onUpdateCriteria,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionDesc, setNewCriterionDesc] = useState('');
  const [newCriterionWeight, setNewCriterionWeight] = useState(2);

  const totals = calculateMatrixTotals(criteria, options);

  // Find winner in matrix
  let highestScore = -1;
  let leaderOptionId = '';
  for (const [optId, stats] of Object.entries(totals)) {
    if (stats.totalWeightedScore > highestScore) {
      highestScore = stats.totalWeightedScore;
      leaderOptionId = optId;
    }
  }

  const handleWeightChange = (criterionId: string, newWeight: number) => {
    const updated = criteria.map((c) =>
      c.id === criterionId ? { ...c, weight: newWeight } : c
    );
    onUpdateCriteria(updated);
  };

  const handleScoreChange = (criterionId: string, optionId: string, newScore: number) => {
    const updated = criteria.map((c) => {
      if (c.id !== criterionId) return c;
      return {
        ...c,
        scores: c.scores.map((s) =>
          s.optionId === optionId ? { ...s, score: newScore } : s
        ),
      };
    });
    onUpdateCriteria(updated);
  };

  const handleAddCriterion = () => {
    if (!newCriterionName.trim()) return;

    const newCriterion: MatrixCriterion = {
      id: `crit-${Date.now()}`,
      name: newCriterionName.trim(),
      description: newCriterionDesc.trim() || 'Custom user evaluation criterion',
      weight: newCriterionWeight,
      scores: options.map((opt) => ({
        optionId: opt.id,
        score: 5,
        rationale: 'User defined baseline score.',
      })),
    };

    onUpdateCriteria([...criteria, newCriterion]);
    setNewCriterionName('');
    setNewCriterionDesc('');
    setIsAddingCriterion(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (score >= 6) return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (score >= 4) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Leaderboard */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Table2 className="w-5 h-5 text-indigo-400" />
              <span>Multi-Criteria Weighted Decision Matrix</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Adjust criterion weights (1x, 2x, 3x) to align with your personal priorities.
            </p>
          </div>

          <button
            onClick={() => setIsAddingCriterion(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors w-fit"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Custom Criterion</span>
          </button>
        </div>

        {/* Live Score Leaderboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {options.map((opt) => {
            const stats = totals[opt.id] || { totalWeightedScore: 0, maxPossible: 100, percentage: 50 };
            const isLeader = opt.id === leaderOptionId;

            return (
              <div
                key={opt.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isLeader
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300 truncate">
                    {opt.name}
                  </span>
                  {isLeader && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                      <Award className="w-3 h-3" />
                      Leader
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    {stats.percentage}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({stats.totalWeightedScore} / {stats.maxPossible} pts)
                  </span>
                </div>

                <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isLeader ? 'bg-gradient-to-r from-amber-400 to-indigo-500' : 'bg-slate-600'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Criterion Modal Drawer */}
      {isAddingCriterion && (
        <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl shadow-xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">
              Add New Evaluation Criterion
            </h3>
            <button
              onClick={() => setIsAddingCriterion(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Criterion Name
              </label>
              <input
                type="text"
                value={newCriterionName}
                onChange={(e) => setNewCriterionName(e.target.value)}
                placeholder="e.g. Work-Life Balance, Growth Ceiling, Commute..."
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Importance Weight
              </label>
              <select
                value={newCriterionWeight}
                onChange={(e) => setNewCriterionWeight(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
              >
                <option value={1}>1x (Standard)</option>
                <option value={2}>2x (High)</option>
                <option value={3}>3x (Critical)</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={newCriterionDesc}
              onChange={(e) => setNewCriterionDesc(e.target.value)}
              placeholder="Why this dimension matters for this specific dilemma..."
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <button
            onClick={handleAddCriterion}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
          >
            Add to Matrix
          </button>
        </div>
      )}

      {/* The Matrix Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60">
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/3">
                  Criterion &amp; Weight
                </th>
                {options.map((opt) => (
                  <th
                    key={opt.id}
                    className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{opt.name}</span>
                      {opt.id === leaderOptionId && (
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {criteria.map((criterion) => (
                <tr
                  key={criterion.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* Criterion Label & Weight Controls */}
                  <td className="py-4 px-4 align-top">
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      <span>{criterion.name}</span>
                    </div>
                    {criterion.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {criterion.description}
                      </p>
                    )}

                    {/* Weight Selector */}
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Weight:
                      </span>
                      {[1, 2, 3].map((w) => (
                        <button
                          key={w}
                          onClick={() => handleWeightChange(criterion.id, w)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                            criterion.weight === w
                              ? 'bg-indigo-600 text-white font-bold shadow-sm'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {w}x
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Option Scores */}
                  {options.map((opt) => {
                    const scoreObj = criterion.scores.find((s) => s.optionId === opt.id) || {
                      optionId: opt.id,
                      score: 5,
                      rationale: 'Baseline',
                    };
                    const colorClass = getScoreColor(scoreObj.score);

                    return (
                      <td key={opt.id} className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {/* Score pill & slider */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg border ${colorClass}`}
                            >
                              {scoreObj.score}/10
                            </span>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={scoreObj.score}
                              onChange={(e) =>
                                handleScoreChange(
                                  criterion.id,
                                  opt.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 sm:w-24 accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                              title="Fine-tune score"
                            />
                          </div>

                          {/* Rationale */}
                          <p className="text-xs text-slate-300 leading-relaxed font-normal">
                            {scoreObj.rationale}
                          </p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
