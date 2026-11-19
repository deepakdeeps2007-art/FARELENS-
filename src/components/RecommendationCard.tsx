'use client';

import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  Bell, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Recommendation, RecommendationVerdict } from '@/core/types/index';
import { ProvenanceBadge } from './ProvenanceBadge';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onTrackClick?: () => void;
}

export function RecommendationCard({ recommendation, onTrackClick }: RecommendationCardProps) {
  const [showWhy, setShowWhy] = useState(false);

  const getVerdictTheme = (verdict: RecommendationVerdict) => {
    switch (verdict) {
      case 'PRICE_DROP_DETECTED':
        return {
          title: 'PRICE DROP DETECTED – BOOK NOW',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <TrendingDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
        };
      case 'HIGH_DEMAND_BOOK_NOW':
        return {
          title: 'HIGH DEMAND – BOOK NOW',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
        };
      case 'WAIT_AND_MONITOR':
        return {
          title: 'WAIT & MONITOR PRICE',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />,
        };
      case 'INSUFFICIENT_DATA':
        return {
          title: 'INSUFFICIENT DATA TO PREDICT',
          bg: 'bg-slate-100 border-slate-300 text-slate-800',
          badgeBg: 'bg-slate-200 text-slate-700 border-slate-300',
          icon: <HelpCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />,
        };
      case 'BOOK_NOW':
      default:
        return {
          title: 'BOOK NOW (STEADY FARE)',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-950',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />,
        };
    }
  };

  const theme = getVerdictTheme(recommendation.verdict);

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-card transition-all ${theme.bg}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5">
        <div className="flex items-center gap-2">
          {theme.icon}
          <h4 className="text-sm font-extrabold tracking-tight">{theme.title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${theme.badgeBg}`}>
            {recommendation.confidence} CONFIDENCE
          </span>
        </div>
      </div>

      {/* Probability Bars (if available) */}
      {recommendation.probabilities && (
        <div className="my-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/70 p-2 rounded-xl border border-black/5">
            <span className="text-[10px] text-slate-500 block">Chance Price Rises</span>
            <span className="text-sm font-extrabold text-rose-600 tabular-nums">
              {recommendation.probabilities.priceUp}%
            </span>
          </div>
          <div className="bg-white/70 p-2 rounded-xl border border-black/5">
            <span className="text-[10px] text-slate-500 block">Chance Price Drops</span>
            <span className="text-sm font-extrabold text-emerald-600 tabular-nums">
              {recommendation.probabilities.priceDown}%
            </span>
          </div>
          <div className="bg-white/70 p-2 rounded-xl border border-black/5">
            <span className="text-[10px] text-slate-500 block">Chance Sells Out</span>
            <span className="text-sm font-extrabold text-amber-600 tabular-nums">
              {recommendation.probabilities.soldOut}%
            </span>
          </div>
        </div>
      )}

      {/* Explanations */}
      <div className="my-3 space-y-1.5 text-xs text-slate-700">
        {recommendation.explanation.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-emerald-600 font-bold mt-0.5">•</span>
            <p className="leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {/* Monitor window if applicable */}
      {recommendation.monitorUntil && (
        <div className="my-2 p-2 bg-amber-500/20 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-between">
          <span>Suggested monitoring window: until <strong>{recommendation.monitorUntil}</strong></span>
          {onTrackClick && (
            <button
              onClick={onTrackClick}
              className="text-xs font-bold text-amber-950 underline hover:no-underline"
            >
              Track Price Now
            </button>
          )}
        </div>
      )}

      {/* Expandable Why This Recommendation */}
      <div className="pt-2 border-t border-black/5">
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
        >
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Why this recommendation? (Evidence &amp; Provenance)</span>
          </span>
          {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showWhy && (
          <div className="mt-3 bg-white/90 rounded-xl p-3 border border-slate-200 text-xs space-y-3">
            <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Data Evidence Points
            </h5>
            <div className="divide-y divide-slate-100">
              {recommendation.evidence.map((ev, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{ev.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 tabular-nums">{ev.value}</span>
                    <ProvenanceBadge provenance={ev.provenance} />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic pt-1">
              {recommendation.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
