import React from 'react';
import Link from 'next/link';
import { 
  Bus, 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Percent,
  Compass
} from 'lucide-react';
import { SearchForm } from '@/components/SearchForm';
import { POPULAR_ROUTES } from '@/db/data/seed';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50 border-b border-slate-200">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-blue-200/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4 border border-emerald-200 shadow-subtle">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>India&apos;s Independent Bus Fare Decision Engine</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Know the <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy underline-offset-8">real payable fare</span> before you book.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Compare final ticket prices across redBus, AbhiBus, MakeMyTrip &amp; Paytm. We factor in convenience fees, GST, and verified payment coupons — then advise whether you should <strong>Book Now</strong> or <strong>Wait</strong>.
            </p>
          </div>

          {/* Interactive Search Card */}
          <div className="max-w-4xl mx-auto">
            <SearchForm />
          </div>

          {/* Trust Value Badges Strip */}
          <div className="max-w-4xl mx-auto mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col items-center">
              <span className="text-lg font-bold text-slate-900 tabular-nums">100%</span>
              <span className="text-xs text-slate-500 font-medium">Payable Price Clarity</span>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col items-center">
              <span className="text-lg font-bold text-emerald-600 tabular-nums">₹150 - ₹400</span>
              <span className="text-xs text-slate-500 font-medium">Coupon Savings Unlocked</span>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col items-center">
              <span className="text-lg font-bold text-slate-900 tabular-nums">0%</span>
              <span className="text-xs text-slate-500 font-medium">Deceptive Urgency Tricks</span>
            </div>
            <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col items-center">
              <span className="text-lg font-bold text-blue-600">Pure Heuristic</span>
              <span className="text-xs text-slate-500 font-medium">Book Now vs Wait Engine</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Questions Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Why FareLens Exists</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Solving the 3 critical dilemmas of Indian bus travellers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dilemma 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Where is the cheapest final price?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Portals advertise deceptively low base fares on search pages, then slap platform fees, payment gateway surcharges, and taxes at checkout. FareLens computes the true final payable amount upfront.
              </p>
            </div>

            {/* Dilemma 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Which coupon actually works?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tired of testing 10 expired coupon codes? Our Coupon Engine simulates your specific basket and payment method (HDFC, CRED, UPI) to show guaranteed verified savings and eligibility criteria.
              </p>
            </div>

            {/* Dilemma 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 hover:border-emerald-200 hover:shadow-card transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Should I book now or wait?</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We track price volatility and seat filling velocity over time. Our transparent recommendation engine tells you when seats are critical vs when operators are likely to drop off-peak fares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Frequently Compared Routes</h2>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">Popular Indian Intercity Corridors</p>
            </div>
            <Link
              href="/search?from=Bangalore&to=Hyderabad"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Explore all routes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={i}
                href={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {route.avgDuration}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                      {route.busCount} daily buses
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <span>{route.from}</span>
                    <span className="text-slate-400">→</span>
                    <span>{route.to}</span>
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">₹{route.minFare}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:underline">
                    Compare <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Book-Now-or-Wait Engine Interactive Preview */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Decision Science</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                No guesses. No fear-mongering.<br />Just transparent data signals.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Most travel booking apps flash misleading warnings like &quot;Only 1 seat left at this price!&quot; to rush you into purchasing. FareLens provides objective decision verdicts with confidence scores, observed price drops, and historical snapshot evidence.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cold-Start Integrity</h4>
                    <p className="text-xs text-slate-500">If we do not possess at least 5 price observations spanning 48h, we explicitly declare &quot;Insufficient Data&quot; rather than speculating.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Price Drop Alerting</h4>
                    <p className="text-xs text-slate-500">When an operator drops a fare by ≥3%, we spotlight the exact historical decrease so you can lock in the dip.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Sample Card */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">Sample Verdict Output</span>
                </div>
                <span className="text-xs text-slate-400">Trip: VRL Volvo Multi-Axle (BLR → HYD)</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Recommendation Verdict</span>
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">HIGH CONFIDENCE</span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-400" />
                    PRICE DROP DETECTED – BOOK NOW
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Payable fare dropped by 10.7% (₹150 savings) from the previous observed level of ₹1,400. Currently at a 72-hour historical low.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Prob. Price Up</span>
                    <span className="text-base font-bold text-rose-400 tabular-nums">45%</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Prob. Price Down</span>
                    <span className="text-base font-bold text-emerald-400 tabular-nums">20%</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Prob. Sold Out</span>
                    <span className="text-base font-bold text-amber-400 tabular-nums">35%</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  * Based on 8 historical price snapshots recorded between Nov 16 and Nov 19, 2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-14 bg-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ready to search your next journey?</h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto font-normal">
            Save time, avoid hidden checkout surprises, and get the best bus ticket deal in India.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/search?from=Bangalore&to=Hyderabad"
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Bus className="w-4 h-4" />
              <span>Search Bangalore → Hyderabad</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
