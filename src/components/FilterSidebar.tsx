'use client';

import React from 'react';
import { Filter, RotateCcw, X, Star } from 'lucide-react';

export interface FilterState {
  busType: 'ALL' | 'AC' | 'NON_AC';
  category: 'ALL' | 'SLEEPER' | 'SEATER';
  timeWindow: 'ALL' | 'EARLY_MORNING' | 'MORNING' | 'AFTERNOON' | 'NIGHT';
  maxPrice: number;
  minRating: number;
  selectedOperators: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableOperators: string[];
  highestPrice: number;
  lowestPrice: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  availableOperators,
  highestPrice,
  lowestPrice,
  isMobileOpen = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const handleOperatorToggle = (op: string) => {
    const list = [...filters.selectedOperators];
    const idx = list.indexOf(op);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(op);
    }
    onChange({ ...filters, selectedOperators: list });
  };

  const content = (
    <div className="space-y-6 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-slate-900">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* AC / Non-AC */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Air Conditioning</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'AC', label: 'AC' },
            { id: 'NON_AC', label: 'Non-AC' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...filters, busType: item.id as any })}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                filters.busType === item.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Format */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Seat Layout</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'SLEEPER', label: 'Sleeper' },
            { id: 'SEATER', label: 'Seater' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...filters, category: item.id as any })}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                filters.category === item.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Departure Window</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'ALL', label: 'Any Time' },
            { id: 'EARLY_MORNING', label: '12am – 6am' },
            { id: 'MORNING', label: '6am – 12pm' },
            { id: 'AFTERNOON', label: '12pm – 6pm' },
            { id: 'NIGHT', label: '6pm – 12am' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ ...filters, timeWindow: item.id as any })}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                filters.timeWindow === item.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Max Payable Fare</h4>
          <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
            ₹{filters.maxPrice}
          </span>
        </div>
        <input
          type="range"
          min={lowestPrice || 300}
          max={highestPrice || 2500}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: parseInt(e.target.value, 10) })}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹{lowestPrice || 300}</span>
          <span>₹{highestPrice || 2500}</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Minimum Operator Rating</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { val: 0, label: 'Any' },
            { val: 4.0, label: '4.0+ ★' },
            { val: 4.5, label: '4.5+ ★' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => onChange({ ...filters, minRating: item.val })}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                filters.minRating === item.val
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operator Checkboxes */}
      {availableOperators.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Bus Operators</h4>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {availableOperators.map((op) => {
              const isChecked = filters.selectedOperators.includes(op);
              return (
                <label
                  key={op}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleOperatorToggle(op)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-slate-800 font-medium">{op}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white rounded-2xl border border-slate-200 p-5 shadow-card h-fit sticky top-20">
        {content}
      </aside>

      {/* Mobile Bottom Sheet Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Filter Search Results</h3>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="pt-3">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
