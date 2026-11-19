'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, Calendar, Users, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { CityAutocomplete } from './CityAutocomplete';

interface SearchFormProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialPassengers?: number;
  initialAcOnly?: boolean;
  initialSleeperOnly?: boolean;
  compact?: boolean;
}

export function SearchForm({
  initialFrom = 'Bangalore',
  initialTo = 'Hyderabad',
  initialDate,
  initialPassengers = 1,
  initialAcOnly = false,
  initialSleeperOnly = false,
  compact = false,
}: SearchFormProps) {
  const router = useRouter();

  // Compute dates for quick chips
  const todayIso = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000);
  const tomorrowIso = tomorrow.toISOString().split('T')[0];

  // Next Saturday for weekend chip
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const nextSaturday = new Date(now.getTime() + daysUntilSaturday * 86400000);
  const weekendIso = nextSaturday.toISOString().split('T')[0];

  const [fromCity, setFromCity] = useState(initialFrom);
  const [toCity, setToCity] = useState(initialTo);
  const [journeyDate, setJourneyDate] = useState(initialDate || tomorrowIso);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [acOnly, setAcOnly] = useState(initialAcOnly);
  const [sleeperOnly, setSleeperOnly] = useState(initialSleeperOnly);
  const [showPreferences, setShowPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleQuickDate = (dateIso: string) => {
    setJourneyDate(dateIso);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromCity.trim()) {
      setError('Please select a departure city');
      return;
    }
    if (!toCity.trim()) {
      setError('Please select an arrival destination');
      return;
    }
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase()) {
      setError('Origin and destination cannot be the same city');
      return;
    }
    if (!journeyDate) {
      setError('Please choose a valid journey date');
      return;
    }

    const params = new URLSearchParams({
      from: fromCity.trim(),
      to: toCity.trim(),
      date: journeyDate,
      passengers: passengers.toString(),
    });

    if (acOnly) params.set('ac', 'true');
    if (sleeperOnly) params.set('sleeper', 'true');

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`bg-white rounded-2xl shadow-card border border-slate-200 p-4 sm:p-5 ${compact ? 'shadow-sm' : 'shadow-lg'}`}>
        {/* Main Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* From City */}
          <div className="md:col-span-4">
            <CityAutocomplete
              label="From City"
              placeholder="e.g. Bangalore, Mumbai"
              value={fromCity}
              onChange={setFromCity}
              excludeCity={toCity}
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 md:my-0 md:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin and Destination"
              aria-label="Swap Cities"
              className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 flex items-center justify-center transition-all shadow-subtle hover:rotate-180 duration-300"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* To City */}
          <div className="md:col-span-4">
            <CityAutocomplete
              label="To Destination"
              placeholder="e.g. Hyderabad, Pune"
              value={toCity}
              onChange={setToCity}
              excludeCity={fromCity}
            />
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Date of Journey
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
              <input
                type="date"
                min={todayIso}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-subtle"
              />
            </div>
          </div>
        </div>

        {/* Quick Date Chips & Passengers & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Quick Date:</span>
            <button
              type="button"
              onClick={() => handleQuickDate(todayIso)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                journeyDate === todayIso
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(tomorrowIso)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                journeyDate === tomorrowIso
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(weekendIso)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                journeyDate === weekendIso
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              This Weekend
            </button>
          </div>

          {/* Preferences Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAcOnly(!acOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                acOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              AC Only
            </button>
            <button
              type="button"
              onClick={() => setSleeperOnly(!sleeperOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sleeperOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sleeper Only
            </button>

            {/* Submit CTA */}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 ml-auto"
            >
              <Search className="w-4 h-4" />
              <span>Compare Bus Fares</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
