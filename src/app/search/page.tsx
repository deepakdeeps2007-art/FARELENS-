'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Bus, 
  ArrowLeftRight, 
  Calendar, 
  Filter, 
  ArrowUpDown, 
  TrendingDown, 
  Clock, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Bell, 
  AlertCircle, 
  Loader2,
  SlidersHorizontal,
  ChevronRight,
  Info
} from 'lucide-react';
import { CanonicalBusTrip, PriceSnapshot, ProviderStatus } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';
import { BusCard } from '@/components/BusCard';
import { FilterSidebar, FilterState } from '@/components/FilterSidebar';
import { SearchForm } from '@/components/SearchForm';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromCity = searchParams.get('from') || 'Bangalore';
  const toCity = searchParams.get('to') || 'Hyderabad';
  const journeyDate = searchParams.get('date') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);
  const acOnly = searchParams.get('ac') === 'true';
  const sleeperOnly = searchParams.get('sleeper') === 'true';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canonicalTrips, setCanonicalTrips] = useState<CanonicalBusTrip[]>([]);
  const [providerStatuses, setProviderStatuses] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, PriceSnapshot[]>>({});
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sorting: 'PRICE_ASC' | 'RATING_DESC' | 'DURATION_ASC' | 'DEPART_EARLIEST' | 'DEPART_LATEST'
  const [sortBy, setSortBy] = useState<'PRICE_ASC' | 'RATING_DESC' | 'DURATION_ASC' | 'DEPART_EARLIEST' | 'DEPART_LATEST'>('PRICE_ASC');

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    busType: acOnly ? 'AC' : 'ALL',
    category: sleeperOnly ? 'SLEEPER' : 'ALL',
    timeWindow: 'ALL',
    maxPrice: 3000,
    minRating: 0,
    selectedOperators: [],
  });

  // Track price modal state
  const [trackingTrip, setTrackingTrip] = useState<CanonicalBusTrip | null>(null);
  const [trackEmail, setTrackEmail] = useState('');
  const [trackSuccess, setTrackSuccess] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  // Fetch search results
  useEffect(() => {
    let isMounted = true;
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCity,
            toCity,
            journeyDate,
            passengers,
            preferences: {
              acOnly,
              sleeperOnly,
            },
          }),
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error?.message || 'Failed to search buses');
        }

        if (isMounted) {
          setCanonicalTrips(data.data.canonicalTrips || []);
          setProviderStatuses(data.data.providerStatuses || []);

          // Load snapshots for each canonical trip for price history & prediction
          const tripKeys = (data.data.canonicalTrips || []).map((t: CanonicalBusTrip) => t.canonicalKey);
          loadSnapshotsForTrips(tripKeys);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Network error while retrieving bus fares');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchResults();
    return () => { isMounted = false; };
  }, [fromCity, toCity, journeyDate, passengers, acOnly, sleeperOnly]);

  const loadSnapshotsForTrips = async (keys: string[]) => {
    const map: Record<string, PriceSnapshot[]> = {};
    for (const key of keys) {
      try {
        const res = await fetch(`/api/v1/trips/${encodeURIComponent(key)}/price-history`);
        const json = await res.json();
        if (json.success && json.data.snapshots) {
          map[key] = json.data.snapshots;
        }
      } catch (e) {
        // Continue fallback
      }
    }
    setSnapshots(map);
  };

  // Derive unique operators and price boundaries
  const availableOperators = useMemo(() => {
    const ops = new Set<string>();
    canonicalTrips.forEach((t) => ops.add(t.operatorName));
    return Array.from(ops);
  }, [canonicalTrips]);

  const { lowestPrice, highestPrice } = useMemo(() => {
    if (canonicalTrips.length === 0) return { lowestPrice: 400, highestPrice: 2500 };
    const prices = canonicalTrips.map((t) => t.cheapestOffer.pricing.finalPriceWithCoupon);
    return {
      lowestPrice: Math.min(...prices),
      highestPrice: Math.max(...prices),
    };
  }, [canonicalTrips]);

  // Filter & Sort logic
  const filteredAndSortedTrips = useMemo(() => {
    return canonicalTrips
      .filter((trip) => {
        const best = trip.cheapestOffer;
        // AC filter
        if (filters.busType === 'AC' && !trip.busType.isAc) return false;
        if (filters.busType === 'NON_AC' && trip.busType.isAc) return false;

        // Category filter
        if (filters.category === 'SLEEPER' && trip.busType.category !== 'SLEEPER') return false;
        if (filters.category === 'SEATER' && trip.busType.category !== 'SEATER') return false;

        // Max price
        if (best.pricing.finalPriceWithCoupon > filters.maxPrice) return false;

        // Rating
        if (filters.minRating > 0 && (best.rating || 0) < filters.minRating) return false;

        // Operators
        if (filters.selectedOperators.length > 0 && !filters.selectedOperators.includes(trip.operatorName)) {
          return false;
        }

        // Departure time window
        const depHour = new Date(trip.departsAt).getHours();
        if (filters.timeWindow === 'EARLY_MORNING' && (depHour >= 6)) return false;
        if (filters.timeWindow === 'MORNING' && (depHour < 6 || depHour >= 12)) return false;
        if (filters.timeWindow === 'AFTERNOON' && (depHour < 12 || depHour >= 18)) return false;
        if (filters.timeWindow === 'NIGHT' && depHour < 18) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') {
          return a.cheapestOffer.pricing.finalPriceWithCoupon - b.cheapestOffer.pricing.finalPriceWithCoupon;
        }
        if (sortBy === 'RATING_DESC') {
          return (b.cheapestOffer.rating || 0) - (a.cheapestOffer.rating || 0);
        }
        if (sortBy === 'DURATION_ASC') {
          return a.durationMinutes - b.durationMinutes;
        }
        if (sortBy === 'DEPART_EARLIEST') {
          return new Date(a.departsAt).getTime() - new Date(b.departsAt).getTime();
        }
        if (sortBy === 'DEPART_LATEST') {
          return new Date(b.departsAt).getTime() - new Date(a.departsAt).getTime();
        }
        return 0;
      });
  }, [canonicalTrips, filters, sortBy]);

  // Key highlights
  const cheapestTrip = useMemo(() => {
    if (canonicalTrips.length === 0) return null;
    return [...canonicalTrips].sort(
      (a, b) => a.cheapestOffer.pricing.finalPriceWithCoupon - b.cheapestOffer.pricing.finalPriceWithCoupon
    )[0];
  }, [canonicalTrips]);

  const fastestTrip = useMemo(() => {
    if (canonicalTrips.length === 0) return null;
    return [...canonicalTrips].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
  }, [canonicalTrips]);

  const bestRatedTrip = useMemo(() => {
    const rated = canonicalTrips.filter((t) => (t.cheapestOffer.rating || 0) >= 4.3);
    if (rated.length === 0) return null;
    return rated.sort((a, b) => (b.cheapestOffer.rating || 0) - (a.cheapestOffer.rating || 0))[0];
  }, [canonicalTrips]);

  const bestCouponTrip = useMemo(() => {
    const withCoupon = canonicalTrips.filter((t) => t.cheapestOffer.pricing.savings > 0);
    if (withCoupon.length === 0) return null;
    return withCoupon.sort((a, b) => b.cheapestOffer.pricing.savings - a.cheapestOffer.pricing.savings)[0];
  }, [canonicalTrips]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackEmail || !trackingTrip) return;
    setTrackLoading(true);
    try {
      const res = await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-demo-1',
          userEmail: trackEmail,
          routeId: `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`,
          fromCity,
          toCity,
          journeyDate,
          tripKey: trackingTrip.canonicalKey,
          operatorName: trackingTrip.operatorName,
          targetPrice: trackingTrip.cheapestOffer.pricing.finalPriceWithCoupon - 50,
          dropPercentThreshold: 5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTrackSuccess(true);
        setTimeout(() => {
          setTrackSuccess(false);
          setTrackingTrip(null);
        }, 2500);
      }
    } catch (err) {
      // Continue
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Sticky Search Summary Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Route & Date Details */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>{fromCity}</span>
                  <span className="text-slate-400">→</span>
                  <span>{toCity}</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span>{new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{passengers} Traveller{passengers > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{canonicalTrips.length} Bus Services Compared</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModifyOpen(!isModifyOpen)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-subtle"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isModifyOpen ? 'Close Search' : 'Modify Search'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Inline Modify Search Drawer */}
          {isModifyOpen && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
              <SearchForm
                initialFrom={fromCity}
                initialTo={toCity}
                initialDate={journeyDate}
                initialPassengers={passengers}
                initialAcOnly={acOnly}
                initialSleeperOnly={sleeperOnly}
                compact
              />
            </div>
          )}

          {/* Provider Status Indicator Chips */}
          {providerStatuses.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] pb-1">
              <span className="text-slate-400 font-medium whitespace-nowrap">Aggregation Status:</span>
              {providerStatuses.map((ps) => (
                <span
                  key={ps.id}
                  className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex items-center gap-1 border ${
                    ps.status === 'DEMO'
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : ps.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title={ps.error || `${ps.offerCount} offers aggregated`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    ps.status === 'DEMO' ? 'bg-amber-500' : ps.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  {ps.name}: {ps.status === 'DEMO' ? 'Demo Mode' : ps.status === 'ACTIVE' ? 'Live' : 'API Key Required'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Top Highlights Strip */}
        {canonicalTrips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {cheapestTrip && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl shadow-subtle">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  Lowest Fare
                </div>
                <div className="text-lg font-black text-emerald-900 tabular-nums">
                  {formatINR(cheapestTrip.cheapestOffer.pricing.finalPriceWithCoupon)}
                </div>
                <div className="text-xs text-emerald-700 font-medium truncate mt-0.5">
                  {cheapestTrip.operatorName}
                </div>
              </div>
            )}

            {fastestTrip && (
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl shadow-subtle">
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Fastest Route
                </div>
                <div className="text-lg font-black text-blue-900 tabular-nums">
                  {Math.floor(fastestTrip.durationMinutes / 60)}h {fastestTrip.durationMinutes % 60}m
                </div>
                <div className="text-xs text-blue-700 font-medium truncate mt-0.5">
                  {fastestTrip.operatorName}
                </div>
              </div>
            )}

            {bestRatedTrip && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl shadow-subtle">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Top Rated
                </div>
                <div className="text-lg font-black text-amber-900 tabular-nums">
                  {bestRatedTrip.cheapestOffer.rating} ★
                </div>
                <div className="text-xs text-amber-700 font-medium truncate mt-0.5">
                  {bestRatedTrip.operatorName}
                </div>
              </div>
            )}

            {bestCouponTrip && (
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl shadow-subtle">
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Max Savings
                </div>
                <div className="text-lg font-black text-purple-900 tabular-nums">
                  Save {formatINR(bestCouponTrip.cheapestOffer.pricing.savings)}
                </div>
                <div className="text-xs text-purple-700 font-medium truncate mt-0.5">
                  via {bestCouponTrip.cheapestOffer.providerName}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Layout: Filters + Results List */}
        <div className="flex gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters({
                busType: 'ALL',
                category: 'ALL',
                timeWindow: 'ALL',
                maxPrice: highestPrice,
                minRating: 0,
                selectedOperators: [],
              })
            }
            availableOperators={availableOperators}
            lowestPrice={lowestPrice}
            highestPrice={highestPrice}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Results Column */}
          <div className="flex-1 min-w-0">
            {/* Sorting & Result Counts Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-subtle mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700">
                Showing <strong className="text-emerald-700">{filteredAndSortedTrips.length}</strong> of {canonicalTrips.length} buses
              </span>

              {/* Sort Menu */}
              <div className="flex items-center gap-2 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="PRICE_ASC">Lowest Final Price</option>
                  <option value="RATING_DESC">Highest Customer Rating</option>
                  <option value="DURATION_ASC">Shortest Duration</option>
                  <option value="DEPART_EARLIEST">Earliest Departure</option>
                  <option value="DEPART_LATEST">Latest Departure</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Comparing Fares Across All Providers...</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Aggregating base fares, applying platform fees, calculating 5% GST, and evaluating applicable payment coupons.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-subtle space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                <h3 className="text-base font-bold text-rose-900">Unable to load fares</h3>
                <p className="text-xs text-rose-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredAndSortedTrips.length === 0 && (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                <Bus className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No buses match your active filters</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your price range, AC preferences, or operator filters to view more travel options.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      busType: 'ALL',
                      category: 'ALL',
                      timeWindow: 'ALL',
                      maxPrice: highestPrice,
                      minRating: 0,
                      selectedOperators: [],
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Bus Cards List */}
            {!loading && !error && filteredAndSortedTrips.map((trip) => (
              <BusCard
                key={trip.id}
                trip={trip}
                snapshots={snapshots[trip.canonicalKey] || []}
                onTrackPrice={(t) => setTrackingTrip(t)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Track Price Modal */}
      {trackingTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Track This Bus Price</h3>
              </div>
              <button
                onClick={() => setTrackingTrip(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{trackingTrip.operatorName}</p>
                <p className="text-slate-500">{fromCity} → {toCity} • {journeyDate}</p>
                <p className="text-emerald-700 font-extrabold text-sm tabular-nums">
                  Current Fare: {formatINR(trackingTrip.cheapestOffer.pricing.finalPriceWithCoupon)}
                </p>
              </div>

              {trackSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-medium">
                  Price tracking alert created! We will email you the moment a price drop is recorded.
                </div>
              ) : (
                <form onSubmit={handleCreateAlert} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. traveller@example.com"
                      value={trackEmail}
                      onChange={(e) => setTrackEmail(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    You will receive an automated alert if the price drops by ≥5% or below {formatINR(trackingTrip.cheapestOffer.pricing.finalPriceWithCoupon - 50)}. You can unsubscribe at any time.
                  </p>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setTrackingTrip(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={trackLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      {trackLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                      <span>Activate Alert</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
