'use client';

import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, AlertCircle, Clock, Tag, CreditCard } from 'lucide-react';
import { Coupon } from '@/core/types/index';

interface CouponCardProps {
  coupon: Coupon;
  onApply?: (code: string) => void;
  isApplied?: boolean;
}

export function CouponCard({ coupon, onApply, isApplied = false }: CouponCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    if (onApply) onApply(coupon.code);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = coupon.verificationStatus === 'EXPIRED';

  return (
    <div className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-card transition-all relative overflow-hidden flex flex-col justify-between ${
      isExpired ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
    }`}>
      {/* Top Banner Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {coupon.providerName}
          </span>

          {coupon.verificationStatus === 'VERIFIED' ? (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified on {coupon.verifiedAt}
            </span>
          ) : isExpired ? (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              Expired
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Unverified – may not apply
            </span>
          )}
        </div>

        {/* Title & Discount Highlight */}
        <h4 className="text-base font-bold text-slate-900 mb-1">{coupon.title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{coupon.description}</p>

        {/* Criteria & Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          {coupon.minAmount && (
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              Min. ₹{coupon.minAmount}
            </span>
          )}
          {coupon.maxDiscount && (
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
              Max Save ₹{coupon.maxDiscount}
            </span>
          )}
          {coupon.paymentMethods.length > 0 && !coupon.paymentMethods.includes('ALL') && (
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              {coupon.paymentMethods.map(m => m.replace('_', ' ')).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Code and Copy CTA */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="bg-slate-50 border border-dashed border-slate-300 px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold text-slate-900 tracking-wider">
          {coupon.code}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={isExpired}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-subtle ${
            copied || isApplied
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
          }`}
        >
          {copied || isApplied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : isApplied ? 'Applied' : 'Copy Code'}</span>
        </button>
      </div>
    </div>
  );
}
