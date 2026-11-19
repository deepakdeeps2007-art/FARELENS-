'use client';

import React, { useState } from 'react';
import { 
  Bus, 
  Clock, 
  Star, 
  Sparkles, 
  TrendingDown, 
  ChevronDown, 
  ChevronUp, 
  Receipt, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Wifi, 
  Coffee, 
  Zap, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { CanonicalBusTrip, NormalizedBusOffer, PriceSnapshot } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';
import { ProvenanceBadge } from './ProvenanceBadge';
import { PriceBreakdownModal } from './PriceBreakdownModal';
import { AffiliateRedirectModal } from './AffiliateRedirectModal';
import { RecommendationCard } from './RecommendationCard';
import { PriceHistoryChart } from './PriceHistoryChart';
import { RecommendationEngine } from '@/core/recommendation/index';

interface BusCardProps {
  trip: CanonicalBusTrip;
  snapshots?: PriceSnapshot[];
  onTrackPrice?: (trip: CanonicalBusTrip) => void;
}

export function BusCard({ trip, snapshots = [], onTrackPrice }: BusCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [breakdownOffer, setBreakdownOffer] = useState<NormalizedBusOffer | null>(null);
  const [bookingOffer, setBookingOffer] = useState<NormalizedBusOffer | null>(null);

  const bestOffer = trip.cheapestOffer;
  const isHighDemand = bestOffer.seatsAvailable !== null && bestOffer.seatsAvailable !== undefined && bestOffer.seatsAvailable <= 6;

  // Format departure & arrival dates
  const depTime = new Date(trip.departsAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const arrTime = new Date(trip.arrivesAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const durationHours = Math.floor(trip.durationMinutes / 60);
  const durationMins = trip.durationMinutes % 60;
  const durationStr = `${durationHours}h ${durationMins > 0 ? `${durationMins}m` : ''}`;

  // Evaluate recommendation for drawer
  const recommendation = RecommendationEngine.recommend({
    currentFinalPrice: bestOffer.pricing.finalPriceWithCoupon,
    snapshots,
    seatsAvailable: bestOffer.seatsAvailable,
    totalSeats: bestOffer.totalSeats,
    daysToDeparture: 2,
    provenance: bestOffer.provenance,
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card hover:shadow-md transition-all overflow-hidden mb-4">
      {/* Highlight Badges Bar */}
      {trip.highlights && trip.highlights.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-1.5 flex flex-wrap items-center gap-2 text-[11px] font-bold">
          {trip.highlights.includes('CHEAPEST') && (
            <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Lowest Fare on Route
            </span>
          )}
          {trip.highlights.includes('FASTEST') && (
            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Fastest Journey
            </span>
          )}
          {trip.highlights.includes('BEST_RATED') && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-slate-950" />
              Top Rated Operator
            </span>
          )}
          {trip.highlights.includes('BEST_COUPON') && (
            <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Biggest Coupon Discount
            </span>
          )}
          {trip.highlights.includes('BEST_VALUE') && (
            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Best Value
            </span>
          )}
        </div>
      )}

      {/* Main Bus Header & Times */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Operator and Bus Type */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{trip.operatorName}</h3>
              {bestOffer.rating && (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  {bestOffer.rating}
                  {bestOffer.reviewCount && (
                    <span className="text-[10px] text-slate-400 font-normal">({bestOffer.reviewCount})</span>
                  )}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {trip.busType.category} • {trip.busType.isAc ? 'AC' : 'Non-AC'} {trip.busType.model ? `• ${trip.busType.model}` : ''}
            </p>

            {/* Seat Availability if provided */}
            {bestOffer.seatsAvailable !== null && bestOffer.seatsAvailable !== undefined && (
              <div className="pt-1">
                {isHighDemand ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    Only {bestOffer.seatsAvailable} seats remaining
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {bestOffer.seatsAvailable} seats available
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Schedule & Landmarks */}
          <div className="md:col-span-5 flex items-center justify-between sm:justify-start sm:gap-6 text-center sm:text-left">
            <div>
              <span className="text-lg font-extrabold text-slate-900 tabular-nums block">{depTime}</span>
              <span className="text-xs text-slate-500 truncate max-w-[120px] block" title={trip.fromCity}>
                {trip.fromCity}
              </span>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[11px] font-semibold text-slate-400 mb-1">{durationStr}</span>
              <div className="w-20 sm:w-24 h-0.5 bg-slate-200 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-600 absolute" />
              </div>
              <span className="text-[10px] text-emerald-700 font-medium mt-1">Direct Service</span>
            </div>

            <div>
              <span className="text-lg font-extrabold text-slate-900 tabular-nums block">{arrTime}</span>
              <span className="text-xs text-slate-500 truncate max-w-[120px] block" title={trip.toCity}>
                {trip.toCity}
              </span>
            </div>
          </div>

          {/* Lowest Price Callout & Primary Action */}
          <div className="md:col-span-3 text-right flex flex-col items-end justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cheapest Final Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-700 tabular-nums">
                {formatINR(bestOffer.pricing.finalPriceWithCoupon)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">via {bestOffer.providerName}</span>

            <button
              type="button"
              onClick={() => setBookingOffer(bestOffer)}
              className="mt-2 w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              <span>Book on {bestOffer.providerName}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-Provider Price Comparison Matrix */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Price Comparison Across Booking Portals ({trip.offers.length})
            </span>
            <ProvenanceBadge provenance={bestOffer.provenance} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {trip.offers.map((offer, idx) => {
              const isCheapest = idx === 0;
              return (
                <div
                  key={offer.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isCheapest
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300/50'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{offer.providerName}</span>
                    {isCheapest && (
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                        Lowest
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        {formatINR(offer.pricing.finalPriceWithCoupon)}
                      </span>
                      {offer.pricing.savings > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Save {formatINR(offer.pricing.savings)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setBreakdownOffer(offer)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 underline flex items-center gap-0.5"
                      title="View complete mathematical breakdown"
                    >
                      <Receipt className="w-3 h-3" />
                      Breakdown
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingOffer(offer)}
                    className={`mt-2 w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      isCheapest
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span>Select</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drawer Toggle Footer */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1 transition-colors"
          >
            <span>{isDrawerOpen ? 'Hide' : 'View'} Fare Trend, Stops &amp; Recommendation</span>
            {isDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {onTrackPrice && (
          <button
            type="button"
            onClick={() => onTrackPrice(trip)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
          >
            <span>Track this bus</span>
          </button>
        )}
      </div>

      {/* Collapsible Drawer: Recommendation, History, Stops */}
      {isDrawerOpen && (
        <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-slate-200 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Recommendation Card */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Objective Decision Guidance
            </h4>
            <RecommendationCard
              recommendation={recommendation}
              onTrackClick={onTrackPrice ? () => onTrackPrice(trip) : undefined}
            />
          </div>

          {/* Price History Graph */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Price Observation History (72 Hours)
            </h4>
            <PriceHistoryChart
              snapshots={snapshots}
              currentPrice={bestOffer.pricing.finalPriceWithCoupon}
            />
          </div>

          {/* Boarding and Dropping Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-2 text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Boarding Points in {trip.fromCity}
              </span>
              <ul className="space-y-1.5 divide-y divide-slate-100">
                {trip.boardingPoints.map((bp) => (
                  <li key={bp.id} className="pt-1.5 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{bp.name}</span>
                    <span className="text-slate-500 font-semibold tabular-nums">{bp.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 uppercase tracking-wider block mb-2 text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Dropping Points in {trip.toCity}
              </span>
              <ul className="space-y-1.5 divide-y divide-slate-100">
                {trip.droppingPoints.map((dp) => (
                  <li key={dp.id} className="pt-1.5 flex justify-between items-center">
                    <span className="font-medium text-slate-800">{dp.name}</span>
                    <span className="text-slate-500 font-semibold tabular-nums">{dp.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {breakdownOffer && (
        <PriceBreakdownModal
          offer={breakdownOffer}
          isOpen={!!breakdownOffer}
          onClose={() => setBreakdownOffer(null)}
        />
      )}

      {bookingOffer && (
        <AffiliateRedirectModal
          offer={bookingOffer}
          isOpen={!!bookingOffer}
          onClose={() => setBookingOffer(null)}
        />
      )}
    </div>
  );
}
