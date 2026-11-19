import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Terms of Use
        </h1>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            By accessing or using FareLens, you acknowledge and agree that FareLens is an information comparison and recommendation service, not a transportation carrier, travel agency, or ticket merchant.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">Independent Decision Support</h2>
          <p>
            Recommendations (&quot;Book Now&quot;, &quot;Wait &amp; Monitor&quot;, &quot;High Demand&quot;, &quot;Price Drop Detected&quot;) are probabilistic estimations based on observed historical pricing snapshots and seat counts where provided. FareLens does not guarantee future ticket prices or inventory availability.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">Booking &amp; Refunds</h2>
          <p>
            All bus tickets are issued by the respective booking provider or bus operator. Any ticket cancellations, schedule changes, refunds, or baggage inquiries must be handled directly with the provider where the ticket was purchased.
          </p>
        </div>
      </div>
    </div>
  );
}
