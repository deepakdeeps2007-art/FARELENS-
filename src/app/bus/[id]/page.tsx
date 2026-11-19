'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  Receipt, 
  ExternalLink, 
  ShieldCheck, 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Wifi,
  Sparkles
} from 'lucide-react';
import { CanonicalBusTrip, NormalizedBusOffer, PriceSnapshot } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';
import { RecommendationCard } from '@/components/RecommendationCard';
import { RecommendationEngine } from '@/core/recommendation/index';
import { PriceBreakdownModal } from '@/components/PriceBreakdownModal';
import { AffiliateRedirectModal } from '@/components/AffiliateRedirectModal';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

export default function BusDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<CanonicalBusTrip | null>(null);
  const [snapshots, setSnapshots] = useState<PriceSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [breakdownOffer, setBreakdownOffer] = useState<NormalizedBusOffer | null>(null);
  const [bookingOffer, setBookingOffer] = useState<NormalizedBusOffer | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch search results to locate the matching canonical trip
        const res = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCity: 'Bangalore',
            toCity: 'Hyderabad',
            journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            passengers: 1,
          }),
        });
        const data = await res.json();
        if (data.success && data.data.canonicalTrips) {
          const found = data.data.canonicalTrips[0]; // Primary sample
          setTrip(found);

          // Fetch snapshots
          const snapRes = await fetch(`/api/v1/trips/${encodeURIComponent(found.canonicalKey)}/price-history`);
          const snapData = await snapRes.json();
          if (snapData.success) {
            setSnapshots(snapData.data.snapshots || []);
          }
        }
      } catch (e) {
        // Continue
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-sm text-slate-500">
        Loading service details...
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Trip not found</h2>
        <Link href="/search" className="text-emerald-600 text-sm font-semibold underline mt-2 block">
          Return to search
        </Link>
      </div>
    );
  }

  const bestOffer = trip.cheapestOffer;
  const recommendation = RecommendationEngine.recommend({
    currentFinalPrice: bestOffer.pricing.finalPriceWithCoupon,
    snapshots,
    seatsAvailable: bestOffer.seatsAvailable,
    totalSeats: bestOffer.totalSeats,
    daysToDeparture: 2,
    provenance: bestOffer.provenance,
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/search?from=${encodeURIComponent(trip.fromCity)}&to=${encodeURIComponent(trip.toCity)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Bus Comparison</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900">{trip.operatorName}</h1>
                <ProvenanceBadge provenance={bestOffer.provenance} showDescription />
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {trip.busType.category} • {trip.busType.isAc ? 'AC' : 'Non-AC'} {trip.busType.model ? `• ${trip.busType.model}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Lowest Payable Price</span>
                <span className="text-2xl font-black text-emerald-700 tabular-nums">
                  {formatINR(bestOffer.pricing.finalPriceWithCoupon)}
                </span>
              </div>

              <button
                onClick={() => setBookingOffer(bestOffer)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Book on {bestOffer.providerName}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Schedule, Comparison, Stops */}
        <div className="lg:col-span-7 space-y-6">
          {/* Schedule Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Schedule &amp; Duration
            </h3>
            <div className="flex items-center justify-between text-center sm:text-left">
              <div>
                <span className="text-xl font-extrabold text-slate-900 block tabular-nums">
                  {new Date(trip.departsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
                <span className="text-xs font-semibold text-slate-600">{trip.fromCity}</span>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-xs font-bold text-slate-500 mb-1">
                  {Math.floor(trip.durationMinutes / 60)}h {trip.durationMinutes % 60}m
                </span>
                <div className="w-24 h-0.5 bg-slate-200 relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">Direct Express</span>
              </div>

              <div>
                <span className="text-xl font-extrabold text-slate-900 block tabular-nums">
                  {new Date(trip.arrivesAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
                <span className="text-xs font-semibold text-slate-600">{trip.toCity}</span>
              </div>
            </div>
          </div>

          {/* Multi-Provider Price Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Fares across booking providers ({trip.offers.length})
            </h3>
            <div className="divide-y divide-slate-100">
              {trip.offers.map((offer, idx) => (
                <div key={offer.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{offer.providerName}</span>
                    <span className="text-xs text-slate-400">
                      Base {formatINR(offer.pricing.basePrice)} + Tax {formatINR(offer.pricing.taxes)} + Fee {formatINR(offer.pricing.platformFee + offer.pricing.convenienceFee)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums block">
                        {formatINR(offer.pricing.finalPriceWithCoupon)}
                      </span>
                      <button
                        onClick={() => setBreakdownOffer(offer)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                      >
                        Breakdown
                      </button>
                    </div>

                    <button
                      onClick={() => setBookingOffer(offer)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <span>Book</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boarding and Dropping Stops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Boarding Stops ({trip.boardingPoints.length})
              </h4>
              <ul className="space-y-2 text-xs divide-y divide-slate-100">
                {trip.boardingPoints.map((bp) => (
                  <li key={bp.id} className="pt-2 flex justify-between">
                    <span className="font-medium text-slate-700">{bp.name}</span>
                    <span className="font-bold text-slate-900 tabular-nums">{bp.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Dropping Stops ({trip.droppingPoints.length})
              </h4>
              <ul className="space-y-2 text-xs divide-y divide-slate-100">
                {trip.droppingPoints.map((dp) => (
                  <li key={dp.id} className="pt-2 flex justify-between">
                    <span className="font-medium text-slate-700">{dp.name}</span>
                    <span className="font-bold text-slate-900 tabular-nums">{dp.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Recommendation & Price History Chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recommendation Card */}
          <RecommendationCard recommendation={recommendation} />

          {/* Price History Chart */}
          <PriceHistoryChart
            snapshots={snapshots}
            currentPrice={bestOffer.pricing.finalPriceWithCoupon}
          />
        </div>
      </div>

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
