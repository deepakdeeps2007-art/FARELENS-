'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Bell, 
  Bookmark, 
  History, 
  TrendingDown, 
  ArrowRight, 
  Bus, 
  Clock, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { POPULAR_ROUTES } from '@/db/data/seed';

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load local or repo search history
    const sample = [
      { from: 'Bangalore', to: 'Hyderabad', date: '2026-11-25', time: '12 mins ago', lowestFare: 850 },
      { from: 'Mumbai', to: 'Pune', date: '2026-11-22', time: '2 hours ago', lowestFare: 349 },
      { from: 'Delhi', to: 'Jaipur', date: '2026-11-28', time: 'Yesterday', lowestFare: 499 },
    ];
    setHistory(sample);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200">
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Traveller Hub</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, Traveller
              </h1>
              <p className="mt-1 text-slate-600 text-sm">
                Track your active price drop alerts, review recent comparisons, and re-run route searches.
              </p>
            </div>

            <Link
              href="/search?from=Bangalore&to=Hyderabad"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Bus className="w-4 h-4" />
              <span>Start New Comparison</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/alerts"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-slate-500 font-medium block">Active Price Sentinels</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">2 Routes</span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1 group-hover:underline">
                Manage alerts <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/coupons"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-slate-500 font-medium block">Verified Coupons</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">7 Active</span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1 group-hover:underline">
                Explore promos <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/calendar"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs text-slate-500 font-medium block">30-Day Fare Calendar</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">Heatmap View</span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1 group-hover:underline">
                Find cheapest days <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </Link>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Data Integrity Score</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">100%</span>
              <span className="text-[11px] text-slate-400 font-medium mt-1">
                Zero fake urgency tricks
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Search Comparisons */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden mb-8">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Fare Comparisons</h3>
            </div>
            <span className="text-xs text-slate-400">Re-run anytime with current fares</span>
          </div>

          <div className="divide-y divide-slate-100">
            {history.map((h, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{h.from}</span>
                    <span className="text-slate-400">→</span>
                    <span>{h.to}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Journey Date: {h.date} • Searched {h.time}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Lowest Fare Found</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">₹{h.lowestFare}</span>
                  </div>

                  <Link
                    href={`/search?from=${encodeURIComponent(h.from)}&to=${encodeURIComponent(h.to)}&date=${h.date}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-slate-200"
                  >
                    <span>Re-compare</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
