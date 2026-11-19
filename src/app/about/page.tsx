import React from 'react';
import { Bus, Target, Users, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Bus className="w-4 h-4" />
          <span>About FareLens</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Know the Real Fare.
        </h1>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            Millions of Indian passengers travel between cities by bus every night. Yet comparing prices across redBus, AbhiBus, MakeMyTrip, and Paytm has always been frustrating: base prices are shown upfront, but hidden platform fees, payment surcharges, and taxes are only revealed at the final checkout step.
          </p>

          <p>
            FareLens was founded by senior engineers to solve this exact problem: an objective price comparison engine that computes the <strong>true final payable price</strong> upfront, tests and applies verified coupons, and gives a data-backed recommendation on whether to <strong>Book Now</strong> or <strong>Wait</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">Total Fee Clarity</h3>
              <p className="text-xs text-slate-500">Every base fare, GST 5% tax, platform fee, and discount is explicitly broken down.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">Coupon Science</h3>
              <p className="text-xs text-slate-500">We verify coupons against specific payment methods (HDFC, CRED, UPI) so you never waste time.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-1">Ethical Guidance</h3>
              <p className="text-xs text-slate-500">If we lack sufficient historical snapshots, we declare Insufficient Data rather than guessing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
