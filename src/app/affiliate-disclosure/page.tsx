import React from 'react';
import { ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparency &amp; Trust Commitment</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Affiliate &amp; Commercial Disclosure
        </h1>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            FareLens is an independent travel technology platform. Our fundamental principle is radical price transparency: we exist to help Indian bus travellers identify the genuine lowest payable fare and determine whether to book or wait.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">How FareLens Makes Money</h2>
          <p>
            When you click on an offer from a booking provider (e.g. redBus, AbhiBus, MakeMyTrip, Paytm) and proceed to book a ticket on their site, we may receive an affiliate referral commission. 
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Zero Cost to You:</strong> You never pay a single rupee extra when booking through FareLens links. Fares are identical or lower due to applied coupons.</li>
            <li><strong>Objective Rankings:</strong> We rank bus offers strictly by their true calculated final payable price. No provider can pay to be displayed as &quot;Cheapest&quot; if their price is higher.</li>
            <li><strong>Zero Fake Scarcity:</strong> We never display fake countdown timers, artificial &quot;Only 1 seat left&quot; banners, or misleading claims to pressure you into purchasing.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">Provider Inventory &amp; API Integrity</h2>
          <p>
            We strictly respect provider terms of service and do not execute unauthorized web scraping. As commercial partnerships and API credentials are confirmed, real-time live inventory feeds are enabled under the <strong>LIVE_VERIFIED</strong> provenance tag.
          </p>
        </div>
      </div>
    </div>
  );
}
