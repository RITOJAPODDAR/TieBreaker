import React, { useState } from 'react';
import {
  Scale,
  Table2,
  Compass,
  Trophy,
  CircleDot,
  Sparkles,
  SlidersHorizontal,
  Share2,
  Copy,
  Check,
  Printer,
  Download,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import {
  DecisionReport,
  OptionAnalysis,
  MatrixCriterion,
} from '../types/decision';
import { ProsConsView } from './ProsConsView';
import { ComparisonMatrixView } from './ComparisonMatrixView';
import { SwotView } from './SwotView';
import { VerdictView } from './VerdictView';
import { CoinFlipLab } from './CoinFlipLab';
import { RefineDrawer } from './RefineDrawer';
import { generateMarkdownReport } from '../utils/calculations';

interface DecisionDashboardProps {
  report: DecisionReport;
  onUpdateReport: (updated: DecisionReport) => void;
  onNewDecision: () => void;
}

type TabType = 'pros-cons' | 'matrix' | 'swot' | 'verdict' | 'coin-flip';

export const DecisionDashboard: React.FC<DecisionDashboardProps> = ({
  report,
  onUpdateReport,
  onNewDecision,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('verdict');
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpdateOptions = (updatedOptions: OptionAnalysis[]) => {
    onUpdateReport({
      ...report,
      options: updatedOptions,
    });
  };

  const handleUpdateCriteria = (updatedCriteria: MatrixCriterion[]) => {
    onUpdateReport({
      ...report,
      matrix: {
        criteria: updatedCriteria,
      },
    });
  };

  const handleLockInChoice = (optionId: string) => {
    onUpdateReport({
      ...report,
      chosenOptionId: optionId,
    });
  };

  const handleCopySummary = async () => {
    const md = generateMarkdownReport(report);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <button
          onClick={onNewDecision}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start Another Decision</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRefineOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Stress-Test / "What If"</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 font-medium transition-colors"
            title="Copy formatted markdown report"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Report</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-700/80 transition-colors"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decision Header Banner */}
      <div className="relative bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-7 shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Decision Analysis
              </span>
              <span className="text-xs text-slate-400">
                Evaluated {new Date(report.createdAt).toLocaleDateString()}
              </span>
              {report.chosenOptionId && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked Choice
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              {report.title}
            </h1>

            {report.summary && (
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
                {report.summary}
              </p>
            )}
          </div>

          {/* Quick Winner Callout Chip */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3 sm:p-4 shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Top Recommendation
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white">
                {report.verdict.recommendedOptionName}
              </span>
              <span className="text-xs text-amber-400 block font-mono">
                {report.verdict.confidenceScore}% Confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-2 scrollbar-none">
          <TabButton
            active={activeTab === 'verdict'}
            onClick={() => setActiveTab('verdict')}
            icon={<Trophy className="w-4 h-4 text-amber-400" />}
            label="The Verdict"
            badge="Decision"
          />
          <TabButton
            active={activeTab === 'pros-cons'}
            onClick={() => setActiveTab('pros-cons')}
            icon={<Scale className="w-4 h-4 text-emerald-400" />}
            label="Pros & Cons"
            badge="Weighted"
          />
          <TabButton
            active={activeTab === 'matrix'}
            onClick={() => setActiveTab('matrix')}
            icon={<Table2 className="w-4 h-4 text-indigo-400" />}
            label="Comparison Matrix"
            badge="Scored"
          />
          <TabButton
            active={activeTab === 'swot'}
            onClick={() => setActiveTab('swot')}
            icon={<Compass className="w-4 h-4 text-sky-400" />}
            label="SWOT Analysis"
            badge="Strategic"
          />
          <TabButton
            active={activeTab === 'coin-flip'}
            onClick={() => setActiveTab('coin-flip')}
            icon={<CircleDot className="w-4 h-4 text-pink-400" />}
            label="Coin Toss Lab"
            badge="Psychology"
          />
        </nav>
      </div>

      {/* Tab Content Display */}
      <main className="min-h-[500px]">
        {activeTab === 'verdict' && (
          <VerdictView
            verdict={report.verdict}
            options={report.options}
            chosenOptionId={report.chosenOptionId}
            onLockInChoice={handleLockInChoice}
          />
        )}

        {activeTab === 'pros-cons' && (
          <ProsConsView
            options={report.options}
            onUpdateOptions={handleUpdateOptions}
          />
        )}

        {activeTab === 'matrix' && (
          <ComparisonMatrixView
            criteria={report.matrix.criteria}
            options={report.options}
            onUpdateCriteria={handleUpdateCriteria}
          />
        )}

        {activeTab === 'swot' && <SwotView options={report.options} />}

        {activeTab === 'coin-flip' && <CoinFlipLab options={report.options} />}
      </main>

      {/* Refine / What-If Drawer */}
      <RefineDrawer
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        report={report}
        onRefineComplete={(updated) => onUpdateReport(updated)}
      />
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
      active
        ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span
        className={`hidden md:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded ${
          active
            ? 'bg-indigo-500/20 text-indigo-300'
            : 'bg-slate-800 text-slate-500'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);
