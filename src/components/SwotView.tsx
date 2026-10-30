import React, { useState } from 'react';
import {
  Compass,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { OptionAnalysis } from '../types/decision';

interface SwotViewProps {
  options: OptionAnalysis[];
}

export const SwotView: React.FC<SwotViewProps> = ({ options }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    options[0]?.id || ''
  );

  const currentOption =
    options.find((o) => o.id === selectedOptionId) || options[0];

  if (!currentOption) return null;

  return (
    <div className="space-y-6">
      {/* Header & Option Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Strategic SWOT Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Internal strengths &amp; weaknesses paired with external opportunities &amp; threats.
          </p>
        </div>

        {/* Option Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedOptionId === opt.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Option Essence Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-indigo-400">
            Currently Inspecting:
          </span>
          <h3 className="text-base font-bold text-white">
            {currentOption.name}
          </h3>
          <p className="text-xs text-slate-400 italic">
            "{currentOption.tagline}"
          </p>
        </div>
        <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 max-w-md">
          <span className="font-semibold text-amber-300">Core Tradeoff: </span>
          {currentOption.keyTradeoff}
        </div>
      </div>

      {/* 2x2 SWOT Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* STRENGTHS */}
        <div className="bg-slate-900/80 rounded-2xl border border-emerald-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Strengths (Internal)
              </h3>
              <p className="text-[11px] text-slate-400">
                Inherent advantages, capabilities &amp; built-in leverage
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mt-4">
            {currentOption.swot.strengths.map((s, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="bg-slate-900/80 rounded-2xl border border-rose-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">
                Weaknesses (Internal)
              </h3>
              <p className="text-[11px] text-slate-400">
                Inherent deficiencies, resource drains &amp; friction points
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mt-4">
            {currentOption.swot.weaknesses.map((w, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="bg-slate-900/80 rounded-2xl border border-sky-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
                Opportunities (External)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tailwinds, serendipitous upside &amp; future optionality
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mt-4">
            {currentOption.swot.opportunities.map((o, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{o}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* THREATS */}
        <div className="bg-slate-900/80 rounded-2xl border border-amber-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                Threats (External)
              </h3>
              <p className="text-[11px] text-slate-400">
                External headwinds, downside events &amp; competitive risks
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 mt-4">
            {currentOption.swot.threats.map((t, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
