import { Provenance } from '../types';

export interface ProvenanceBadgeConfig {
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  isDemo: boolean;
}

export function getProvenanceConfig(provenance: Provenance): ProvenanceBadgeConfig {
  switch (provenance) {
    case 'LIVE_VERIFIED':
      return {
        label: 'Live Verified API',
        shortLabel: 'LIVE',
        description: 'Directly fetched within the last 15 minutes from the provider API.',
        badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800',
        isDemo: false,
      };
    case 'RECENT':
      return {
        label: 'Recently Cached',
        shortLabel: 'RECENT',
        description: 'Observed earlier today. Prices may have slight variations at checkout.',
        badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
        badgeText: 'text-blue-700 dark:text-blue-300',
        badgeBorder: 'border-blue-200 dark:border-blue-800',
        isDemo: false,
      };
    case 'HISTORICAL':
      return {
        label: 'Historical Observation',
        shortLabel: 'HISTORICAL',
        description: 'Archived snapshot recorded during previous tracking intervals.',
        badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        badgeText: 'text-slate-700 dark:text-slate-300',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
        isDemo: false,
      };
    case 'ESTIMATED':
      return {
        label: 'Statistical Estimate',
        shortLabel: 'ESTIMATE',
        description: 'Algorithmic projection based on historical route trends.',
        badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200 dark:border-purple-800',
        isDemo: false,
      };
    case 'DEMO':
    default:
      return {
        label: 'Demonstration Data',
        shortLabel: 'DEMO',
        description: 'Synthetic demonstration data. Not real-time prices or availability.',
        badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200',
        badgeText: 'text-amber-900 dark:text-amber-200',
        badgeBorder: 'border-amber-300 dark:border-amber-700',
        isDemo: true,
      };
  }
}

export function formatTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
