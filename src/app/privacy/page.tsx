import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          <span>India DPDP Act Compliant</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy
        </h1>

        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            FareLens Technologies values your personal privacy. We operate on a principle of minimal data collection: you can browse, compare bus prices, and discover coupons without creating an account or providing personal information.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Price Alert Subscriptions:</strong> If you request price tracking, we collect your email address solely to dispatch alert notifications. You can unsubscribe with one click.</li>
            <li><strong>Anonymous Search Telemetry:</strong> Origin and destination search queries to compute route popularity and historical demand metrics.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">Zero Payment Data Storage</h2>
          <p>
            FareLens is not a booking merchant. We never request, process, or store credit card numbers, UPI PINs, or bank credentials. All booking transactions take place securely on official provider portals.
          </p>
        </div>
      </div>
    </div>
  );
}
