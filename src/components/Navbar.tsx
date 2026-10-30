import React from 'react';
import { Scale, History, PlusCircle, Sparkles, Download, Printer } from 'lucide-react';
import { DECISION_TEMPLATES } from '../data/templates';
import { DecisionTemplate } from '../types/decision';

interface NavbarProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  onSelectTemplate: (template: DecisionTemplate) => void;
  onPrint?: () => void;
  onExportMarkdown?: () => void;
  hasActiveReport: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDecision,
  onOpenHistory,
  savedCount,
  onSelectTemplate,
  onPrint,
  onExportMarkdown,
  hasActiveReport,
}) => {
  const [templateMenuOpen, setTemplateMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-500 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                The Tiebreaker
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Objective clarity for tough decisions
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Templates Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Example</span> Dilemmas
            </button>

            {templateMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setTemplateMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Preloaded Decision Scenarios
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 py-1">
                    {DECISION_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectTemplate(t);
                          setTemplateMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-800/80 transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs text-indigo-400 font-medium mb-1">
                          <span>{t.category}</span>
                          <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
                            Try →
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {t.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Export / Print (if active report) */}
          {hasActiveReport && (
            <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-2">
              {onExportMarkdown && (
                <button
                  onClick={onExportMarkdown}
                  title="Export Markdown Report"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {onPrint && (
                <button
                  onClick={onPrint}
                  title="Print / Save as PDF"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-500/30 text-indigo-300 text-[11px] font-semibold rounded-full border border-indigo-500/40">
                {savedCount}
              </span>
            )}
          </button>

          {/* New Decision Button */}
          <button
            onClick={onNewDecision}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Decision</span>
          </button>
        </div>
      </div>
    </header>
  );
};
