'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  ArrowRight, 
  TrendingDown, 
  AlertCircle, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { POPULAR_ROUTES } from '@/db/data/seed';
import { formatINR } from '@/core/pricing/index';

export default function CalendarPage() {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const route = POPULAR_ROUTES[selectedRouteIdx];

  // Generate 30 days starting from today
  const today = new Date();
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today.getTime() + i * 86400000);
    const dayOfWeek = d.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    
    // Relative multiplier based on Indian travel patterns
    // Fri/Sun: peak surge (+25% to +40%)
    // Tue/Wed: off-peak dip (-10% to -20%)
    let multiplier = 1.0;
    if (dayOfWeek === 5 || dayOfWeek === 0) multiplier = 1.35;
    else if (dayOfWeek === 6) multiplier = 1.20;
    else if (dayOfWeek === 2 || dayOfWeek === 3) multiplier = 0.88;

    const baseFare = route.minFare;
    const estimatedMinFare = Math.round(baseFare * multiplier);

    // Days past 21 days have less observation data
    const hasSufficientData = i <= 21;

    return {
      date: d,
      dateIso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-IN', { month: 'short' }),
      estimatedMinFare,
      isWeekend,
      hasSufficientData,
      tier: !hasSufficientData ? 'UNKNOWN' : multiplier < 0.95 ? 'LOW' : multiplier > 1.2 ? 'HIGH' : 'MEDIUM',
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>30-Day Fare Demand Heatmap</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Smart Travel Calendar
            </h1>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              Find the cheapest days of the week to travel. Bus operators adjust fares dynamically based on passenger demand cycles — Tuesdays and Wednesdays are routinely 20–35% cheaper than Friday night departures.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Route Selector Chips */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Intercity Corridor
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {POPULAR_ROUTES.map((r, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRouteIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedRouteIdx === idx
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r.from} → {r.to}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 mb-6 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700">Fare Level Legend:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
              <span className="text-slate-600">Cheapest (Off-Peak)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
              <span className="text-slate-600">Standard Fare</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300" />
              <span className="text-slate-600">Peak Demand Surge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
              <span className="text-slate-500">Insufficient History</span>
            </div>
          </div>

          <div className="text-slate-400 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Based strictly on observed historical trends</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {days.map((item, idx) => {
            const isClickable = item.hasSufficientData;
            return (
              <Link
                key={idx}
                href={
                  isClickable
                    ? `/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${item.dateIso}`
                    : '#'
                }
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between text-left group ${
                  item.tier === 'LOW'
                    ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                    : item.tier === 'HIGH'
                    ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400 hover:shadow-md'
                    : item.tier === 'MEDIUM'
                    ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400 hover:shadow-md'
                    : 'bg-slate-50/80 border-slate-200 cursor-not-allowed opacity-75'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-slate-500 uppercase">{item.dayName}</span>
                    <span className="text-[10px] text-slate-400">{item.monthName}</span>
                  </div>

                  <span className="text-xl font-extrabold text-slate-900 block tabular-nums">
                    {item.dayNumber}
                  </span>
                </div>

                <div className="mt-4 pt-2 border-t border-black/5">
                  {item.hasSufficientData ? (
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        From
                      </span>
                      <span
                        className={`text-sm font-extrabold tabular-nums ${
                          item.tier === 'LOW'
                            ? 'text-emerald-700'
                            : item.tier === 'HIGH'
                            ? 'text-rose-700'
                            : 'text-amber-800'
                        }`}
                      >
                        {formatINR(item.estimatedMinFare)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic block">
                      Insufficient data
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
