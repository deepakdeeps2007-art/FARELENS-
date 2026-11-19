'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  CreditCard, 
  Calculator, 
  ArrowRight, 
  Check, 
  Copy, 
  Percent,
  PlusCircle,
  Filter
} from 'lucide-react';
import { Coupon, CouponType } from '@/core/types/index';
import { CouponCard } from '@/components/CouponCard';
import { formatINR } from '@/core/pricing/index';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1200);
  const [calcPaymentMethod, setCalcPaymentMethod] = useState<string>('ALL');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  // Community Submit Modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitCode, setSubmitCode] = useState('');
  const [submitProvider, setSubmitProvider] = useState('redBus');
  const [submitDiscount, setSubmitDiscount] = useState('100');
  const [submitDesc, setSubmitDesc] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const res = await fetch('/api/v1/coupons');
        const data = await res.json();
        if (data.success) {
          setCoupons(data.data);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (selectedProvider !== 'ALL' && c.providerId !== 'ALL' && c.providerId !== selectedProvider) {
        return false;
      }
      if (selectedType !== 'ALL' && c.type !== selectedType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.providerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [coupons, selectedProvider, selectedType, searchQuery]);

  // Interactive Calculator Logic
  const calculationResult = useMemo(() => {
    if (!calcAmount || calcAmount <= 0) return null;

    const eligible = coupons.filter((c) => {
      if (c.verificationStatus === 'EXPIRED') return false;
      if (c.minAmount && calcAmount < c.minAmount) return false;
      if (c.type === 'FIRST_TIME' && !isFirstTime) return false;
      if (calcPaymentMethod !== 'ALL') {
        const hasMethod = c.paymentMethods.includes('ALL') || c.paymentMethods.includes(calcPaymentMethod);
        if (!hasMethod) return false;
      }
      return true;
    });

    const evaluated = eligible.map((c) => {
      let discount = 0;
      if (c.discountType === 'PERCENT') {
        const raw = (calcAmount * c.discountValue) / 100;
        discount = c.maxDiscount ? Math.min(raw, c.maxDiscount) : raw;
      } else {
        discount = c.discountValue;
      }
      discount = Math.min(calcAmount, Math.round(discount));
      return {
        coupon: c,
        discount,
        finalPrice: calcAmount - discount,
      };
    });

    evaluated.sort((a, b) => b.discount - a.discount);
    return evaluated.length > 0 ? evaluated[0] : null;
  }, [coupons, calcAmount, calcPaymentMethod, isFirstTime]);

  const handleSubmitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitCode.trim()) return;

    try {
      const res = await fetch('/api/v1/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: `demo-${submitProvider.toLowerCase().replace(/\s+/g, '')}`,
          providerName: submitProvider,
          code: submitCode.trim().toUpperCase(),
          title: `${submitProvider}: Flat ₹${submitDiscount} Off`,
          description: submitDesc || 'Submitted by community traveller',
          type: 'PUBLIC',
          discountType: 'FLAT',
          discountValue: parseInt(submitDiscount, 10) || 50,
          minAmount: 500,
          paymentMethods: ['ALL'],
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          source: 'COMMUNITY_SUBMISSION',
          verificationStatus: 'UNVERIFIED',
          verifiedAt: new Date().toISOString().split('T')[0],
          verifiedBy: 'Community',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons([data.data, ...coupons]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setIsSubmitOpen(false);
          setSubmitCode('');
          setSubmitDesc('');
        }, 2000);
      }
    } catch (err) {
      // Continue
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified &amp; Active Coupon Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bus Ticket Coupons That <span className="text-emerald-600">Actually Work.</span>
            </h1>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              No more trying 15 expired promo codes at checkout. Every coupon on FareLens has been verified by our automated check bot or admin team, complete with minimum order conditions and bank card rules.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Interactive Instant Savings Calculator */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-12 border border-emerald-800/40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Calculator className="w-4 h-4" />
                <span>Instant Coupon Matcher</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Calculate the highest possible discount for your trip
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">
                Enter your ticket fare and preferred payment method to uncover which coupon yields the highest real savings.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Booking Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={calcPaymentMethod}
                    onChange={(e) => setCalcPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="ALL">Any Payment Method</option>
                    <option value="HDFC_CREDIT_CARD">HDFC Credit Card</option>
                    <option value="HDFC_DEBIT_CARD">HDFC Debit Card</option>
                    <option value="CRED_UPI">CRED UPI</option>
                    <option value="PAYTM_WALLET">Paytm Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    User Status
                  </label>
                  <select
                    value={isFirstTime ? 'first' : 'existing'}
                    onChange={(e) => setIsFirstTime(e.target.value === 'first')}
                    className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="first">First Time Booking</option>
                    <option value="existing">Repeat Traveller</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Calculated Winner Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              {calculationResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                      Best Match Found
                    </span>
                    <span className="text-xs text-slate-300 font-mono font-bold">
                      {calculationResult.coupon.code}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{calculationResult.coupon.title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5">{calculationResult.coupon.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">You Pay (After Coupon)</span>
                      <span className="text-2xl font-black text-emerald-400 tabular-nums">
                        {formatINR(calculationResult.finalPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">You Save</span>
                      <span className="text-lg font-bold text-white tabular-nums">
                        {formatINR(calculationResult.discount)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No eligible coupon for this exact combination. Standard fare of ₹{calcAmount} applies.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search coupon code or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Provider Filter */}
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Providers</option>
              <option value="demo-redbus">redBus</option>
              <option value="demo-abhibus">AbhiBus</option>
              <option value="demo-makemytrip">MakeMyTrip</option>
              <option value="demo-paytm">Paytm Bus</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="PUBLIC">Public Promo</option>
              <option value="BANK">Bank Cards (HDFC, ICICI)</option>
              <option value="WALLET">Wallets / UPI</option>
              <option value="FIRST_TIME">New User</option>
            </select>

            <button
              onClick={() => setIsSubmitOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-subtle transition-colors ml-auto md:ml-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Coupon</span>
            </button>
          </div>
        </div>

        {/* Coupon Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading verified coupon catalog...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800">No coupons match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your category or provider selections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>

      {/* Community Submit Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Submit a Verified Bus Coupon</h3>
            <p className="text-xs text-slate-500">
              Found a working bus coupon? Help other travellers save. All submissions are marked as &quot;Unverified&quot; until tested by our bot.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 font-bold">
                Coupon submitted successfully! Thank you for sharing.
              </div>
            ) : (
              <form onSubmit={handleSubmitCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Provider</label>
                  <select
                    value={submitProvider}
                    onChange={(e) => setSubmitProvider(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="redBus">redBus</option>
                    <option value="AbhiBus">AbhiBus</option>
                    <option value="MakeMyTrip">MakeMyTrip</option>
                    <option value="Paytm Bus">Paytm Bus</option>
                    <option value="Zingbus">Zingbus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coupon Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE200"
                    value={submitCode}
                    onChange={(e) => setSubmitCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={submitDiscount}
                    onChange={(e) => setSubmitDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Details &amp; Restrictions</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Valid on AC buses above ₹500"
                    value={submitDesc}
                    onChange={(e) => setSubmitDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-sm"
                  >
                    Submit for Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
