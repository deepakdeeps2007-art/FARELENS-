'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { POPULAR_CITIES } from '@/db/data/seed';
import { City } from '@/core/types/index';

interface CityAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (city: string) => void;
  excludeCity?: string;
}

export function CityAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  excludeCity,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<City[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const filtered = POPULAR_CITIES.filter((c) => {
      if (excludeCity && c.name.toLowerCase() === excludeCity.toLowerCase()) {
        return false;
      }
      if (!q) return c.isPopular;
      return (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
    setMatches(filtered);
  }, [query, excludeCity]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (cityName: string) => {
    setQuery(cityName);
    onChange(cityName);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-subtle"
        />
      </div>

      {isOpen && matches.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {query.trim() ? 'Matching Cities' : 'Popular Bus Hubs'}
          </div>
          {matches.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelect(city.name)}
              className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 flex items-center justify-between text-sm transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-800">{city.name}</span>
                <span className="text-xs text-slate-400">({city.state})</span>
              </div>
              {city.isPopular && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Popular Hub
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
