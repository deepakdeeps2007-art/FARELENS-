'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export function DemoBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 text-xs px-4 py-2 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Demonstration Data:</strong> Real-time bus prices and live seat inventories are currently in Demo Mode. Fares and coupons are synthetic.
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-amber-800 hover:text-amber-950 underline flex items-center gap-1 font-semibold flex-shrink-0"
        >
          {isExpanded ? 'Hide Details' : 'Why Demo?'}
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-500/20 text-slate-700 leading-relaxed text-[11px] grid md:grid-cols-3 gap-3">
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              1. Non-Negotiable Data Integrity
            </h4>
            <p>
              FareLens never displays scraped or fabricated data as live. Indian booking portals (redBus, AbhiBus, MMT) do not have public APIs.
            </p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              2. Authentic Adapter Architecture
            </h4>
            <p>
              Real adapters for redBus, AbhiBus, and GDS aggregators are built and will activate automatically as corporate partnership API keys are provisioned.
            </p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              3. Booking Link Behaviour
            </h4>
            <p>
              In Demo Mode, clicking &quot;Book on Provider&quot; directs to the respective provider&apos;s official homepage with an educational disclosure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
