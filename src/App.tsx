import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DecisionForm } from './components/DecisionForm';
import { DecisionDashboard } from './components/DecisionDashboard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DecisionReport, DecisionTemplate } from './types/decision';
import { generateMarkdownReport } from './utils/calculations';
import { AlertCircle, Scale, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'tiebreaker_saved_decisions_v1';

export default function App() {
  const [currentReport, setCurrentReport] = useState<DecisionReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DecisionTemplate | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionReport[]>([]);

  // Load saved history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedDecisions(parsed);
          // If there is a recent decision, load the latest one as initial view for convenience
          if (parsed.length > 0 && !currentReport) {
            setCurrentReport(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved decisions:', e);
    }
  }, []);

  // Save changes to localStorage
  const persistDecision = (report: DecisionReport) => {
    setSavedDecisions((prev) => {
      const existingIdx = prev.findIndex((d) => d.id === report.id);
      let updated: DecisionReport[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = report;
      } else {
        updated = [report, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Storage error:', e);
      }
      return updated;
    });
  };

  const handleAnalyze = async (formData: {
    title: string;
    options: string[];
    context: string;
    userPriorities: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to analyze decision.');
      }

      if (result.data) {
        const newReport: DecisionReport = {
          ...result.data,
          id: `dec-${Date.now()}`,
          createdAt: new Date().toISOString(),
          context: formData.context,
          userPriorities: formData.userPriorities,
        };

        setCurrentReport(newReport);
        persistDecision(newReport);
        setSelectedTemplate(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'An unexpected error occurred while analyzing the decision. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReport = (updated: DecisionReport) => {
    setCurrentReport(updated);
    persistDecision(updated);
  };

  const handleDeleteDecision = (id: string) => {
    const updated = savedDecisions.filter((d) => d.id !== id);
    setSavedDecisions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (currentReport?.id === id) {
      setCurrentReport(updated[0] || null);
    }
  };

  const handleClearAllHistory = () => {
    setSavedDecisions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setCurrentReport(null);
  };

  const handleExportMarkdown = () => {
    if (!currentReport) return;
    const md = generateMarkdownReport(currentReport);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiebreaker-${currentReport.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        onNewDecision={() => {
          setCurrentReport(null);
          setSelectedTemplate(null);
          setError(null);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedDecisions.length}
        onSelectTemplate={(t) => {
          setSelectedTemplate(t);
          setCurrentReport(null);
        }}
        onPrint={() => window.print()}
        onExportMarkdown={handleExportMarkdown}
        hasActiveReport={Boolean(currentReport)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col">
        {/* Error notification banner */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mt-4 w-full">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Error analyzing decision:</span> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 hover:text-rose-200 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Content routing */}
        {currentReport ? (
          <DecisionDashboard
            report={currentReport}
            onUpdateReport={handleUpdateReport}
            onNewDecision={() => {
              setCurrentReport(null);
              setSelectedTemplate(null);
            }}
          />
        ) : (
          <DecisionForm
            onSubmit={handleAnalyze}
            isLoading={isLoading}
            initialTemplate={selectedTemplate}
          />
        )}
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={(report) => {
          setCurrentReport(report);
          setSelectedTemplate(null);
        }}
        onDeleteDecision={handleDeleteDecision}
        onClearAll={handleClearAllHistory}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500">
        <p>The Tiebreaker — Multidimensional Decision Analysis &amp; Strategic Evaluation</p>
      </footer>
    </div>
  );
}
