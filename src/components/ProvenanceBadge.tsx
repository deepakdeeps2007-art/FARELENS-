import React from 'react';
import { Provenance } from '@/core/types/index';
import { getProvenanceConfig } from '@/core/provenance/index';
import { ShieldCheck, Clock, Database, Sparkles, AlertCircle } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: Provenance;
  showDescription?: boolean;
  size?: 'sm' | 'md';
}

export function ProvenanceBadge({ provenance, showDescription = false, size = 'sm' }: ProvenanceBadgeProps) {
  const config = getProvenanceConfig(provenance);

  const getIcon = () => {
    switch (provenance) {
      case 'LIVE_VERIFIED':
        return <ShieldCheck className="w-3 h-3 text-emerald-600" />;
      case 'RECENT':
        return <Clock className="w-3 h-3 text-blue-600" />;
      case 'HISTORICAL':
        return <Database className="w-3 h-3 text-slate-600" />;
      case 'ESTIMATED':
        return <Sparkles className="w-3 h-3 text-purple-600" />;
      case 'DEMO':
      default:
        return <AlertCircle className="w-3 h-3 text-amber-700" />;
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={config.description}>
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full border ${config.badgeBg} ${config.badgeBorder} ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        {getIcon()}
        <span>{config.shortLabel}</span>
      </span>
      {showDescription && (
        <span className="text-[11px] text-slate-500 font-normal">{config.label}</span>
      )}
    </div>
  );
}
