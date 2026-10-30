import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  ExternalLink,
  Search,
  Trophy,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { DecisionReport } from '../types/decision';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionReport[];
  onSelectDecision: (report: DecisionReport) => void;
  onDeleteDecision: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = savedDecisions.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.verdict.recommendedOptionName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Decision Archive
              </h3>
              <p className="text-xs text-slate-400">
                {savedDecisions.length} saved analysis reports
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

        {/* Search Bar */}
        {savedDecisions.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search past decisions..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No saved decisions found</p>
              <p className="text-xs text-slate-600">
                Any decision you analyze or lock in will be archived here.
              </p>
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    onClick={() => {
                      onSelectDecision(d);
                      onClose();
                    }}
                    className="cursor-pointer flex-1"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors line-clamp-2">
                      {d.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-400 font-semibold">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Winner: {d.verdict.recommendedOptionName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ({d.verdict.confidenceScore}%)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDecision(d.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedDecisions.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-400 transition-colors"
            >
              Clear all history
            </button>
            <span className="text-slate-600">Stored locally in browser</span>
          </div>
        )}
      </div>
    </div>
  );
};
