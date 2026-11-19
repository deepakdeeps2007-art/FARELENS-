'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  ShieldCheck, 
  Server, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  Database, 
  FileText,
  Activity,
  Plus
} from 'lucide-react';
import { Coupon, ProviderStatus } from '@/core/types/index';

export default function AdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'providers' | 'coupons' | 'telemetry'>('providers');

  const providerIntegrations = [
    {
      id: 'redbus',
      name: 'redBus',
      type: 'Direct Partner / Affiliate',
      status: 'NEEDS_CREDENTIALS' as ProviderStatus,
      requiredEnv: ['PROVIDER_REDBUS_API_KEY', 'PROVIDER_REDBUS_CLIENT_ID'],
      notes: 'Requires approval via Impact Radius affiliate network or direct B2B bus GDS agreement.',
    },
    {
      id: 'abhibus',
      name: 'AbhiBus (ixigo group)',
      type: 'B2B Partner API',
      status: 'NEEDS_CREDENTIALS' as ProviderStatus,
      requiredEnv: ['PROVIDER_ABHIBUS_API_KEY', 'PROVIDER_ABHIBUS_SECRET'],
      notes: 'Requires corporate affiliate key agreement with ixigo/AbhiBus commercial team.',
    },
    {
      id: 'makemytrip',
      name: 'MakeMyTrip',
      type: 'Affiliate Network',
      status: 'NEEDS_CREDENTIALS' as ProviderStatus,
      requiredEnv: ['PROVIDER_MMT_PARTNER_KEY', 'PROVIDER_MMT_SECRET'],
      notes: 'Integrated via vCommission / Cuelinks affiliate feed or MMT Group partner program.',
    },
    {
      id: 'paytm',
      name: 'Paytm Bus',
      type: 'Developer Gateway',
      status: 'NEEDS_CREDENTIALS' as ProviderStatus,
      requiredEnv: ['PROVIDER_PAYTM_CLIENT_ID', 'PROVIDER_PAYTM_SECRET'],
      notes: 'Available through Paytm affiliate portal.',
    },
    {
      id: 'aggregator',
      name: 'Authorised Bus GDS Aggregator',
      type: 'B2B Inventory GDS',
      status: 'NEEDS_CREDENTIALS' as ProviderStatus,
      requiredEnv: ['PROVIDER_AGGREGATOR_BASE_URL', 'PROVIDER_AGGREGATOR_API_KEY'],
      notes: 'Connects to Mantis CRS, Bitla, or TravelCarma B2B inventory.',
    },
    {
      id: 'demo-engine',
      name: 'FareLens Synthetic Engine',
      type: 'Deterministic Demo Adapter',
      status: 'DEMO' as ProviderStatus,
      requiredEnv: ['DEMO_MODE_ENABLED'],
      notes: 'Active out of the box for high-fidelity evaluation and compliance testing.',
    },
  ];

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch('/api/v1/coupons');
        const data = await res.json();
        if (data.success) {
          setCoupons(data.data);
        }
      } catch (e) {
        // Continue
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const handleUpdateStatus = async (couponId: string, newStatus: 'VERIFIED' | 'EXPIRED') => {
    try {
      const res = await fetch('/api/v1/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: couponId,
          status: newStatus,
          verifiedBy: 'Senior Engineer (Admin Portal)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data.data : c)));
      }
    } catch (e) {
      // Continue
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
            <Lock className="w-4 h-4" />
            <span>Role-Protected Admin Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Administration &amp; Data Provenance
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Manage provider adapter credentials, curate and verify live bus coupons, and inspect data integrity logs.
          </p>

          {/* Navigation tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('providers')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'providers'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Provider Adapters &amp; APIs</span>
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'coupons'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Coupon Verification Desk</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-amber-950 mb-0.5">
                  How Legitimate Provider Integration Works
                </strong>
                redBus, AbhiBus, and MakeMyTrip strictly enforce anti-scraping policies. FareLens implements modular adapters for each provider. To activate live data, enter your authorized partner keys in <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">.env.local</code>. When credentials are missing, FareLens safely reports <span className="font-semibold text-slate-800">NEEDS_CREDENTIALS</span> and relies on transparently labelled demonstration data.
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Registered Provider Adapters</h3>
                <span className="text-xs text-slate-500">{providerIntegrations.length} Providers Configured</span>
              </div>

              <div className="divide-y divide-slate-100">
                {providerIntegrations.map((p) => (
                  <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{p.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.status === 'DEMO'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {p.status === 'DEMO' ? 'ACTIVE (DEMO)' : 'PENDING CREDENTIALS'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{p.type} • {p.notes}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Required Keys:</span>
                        {p.requiredEnv.map((k) => (
                          <code key={k} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {k}
                          </code>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/docs/INTEGRATIONS.md"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg whitespace-nowrap self-start sm:self-center"
                    >
                      Integration Guide
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Live Coupon Catalog &amp; Verification Status</h3>
              <span className="text-xs text-slate-500">{coupons.length} Active Offers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Provider &amp; Code</th>
                    <th className="p-3">Title &amp; Type</th>
                    <th className="p-3">Discount Rule</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Verified By</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 text-sm block">{c.code}</span>
                        <span className="text-[10px] text-slate-400">{c.providerName}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{c.title}</span>
                        <span className="text-[10px] text-slate-500">{c.type}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        </span>
                        {c.minAmount && <span className="text-[10px] text-slate-400 block">Min ₹{c.minAmount}</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : c.verificationStatus === 'EXPIRED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {c.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        <span>{c.verifiedBy}</span>
                        <span className="block text-[10px] text-slate-400">{c.verifiedAt}</span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        {c.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px]"
                          >
                            Verify
                          </button>
                        )}
                        {c.verificationStatus !== 'EXPIRED' && (
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'EXPIRED')}
                            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold text-[10px]"
                          >
                            Mark Expired
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
