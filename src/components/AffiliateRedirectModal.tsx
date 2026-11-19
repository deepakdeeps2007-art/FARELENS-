'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { NormalizedBusOffer } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';

interface AffiliateRedirectModalProps {
  offer: NormalizedBusOffer;
  isOpen: boolean;
  onClose: () => void;
}

export function AffiliateRedirectModal({ offer, isOpen, onClose }: AffiliateRedirectModalProps) {
  const [copied, setCopied] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const couponCode = offer.pricing.appliedCoupon?.code;

  const handleCopyCode = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceed = async () => {
    setIsRedirecting(true);
    try {
      // Log outbound telemetry via API
      await fetch(`/api/v1/out/${encodeURIComponent(offer.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: offer.providerId,
          tripId: offer.tripId,
          finalPrice: offer.pricing.finalPriceWithCoupon,
        }),
      });
    } catch (e) {
      // Continue even if logging fails
    }

    // Open destination URL in new tab
    window.open(offer.deepLink, '_blank', 'noopener,noreferrer');
    setIsRedirecting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              {offer.providerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Book on {offer.providerName}</h3>
              <p className="text-xs text-slate-500">Official Booking Provider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Service Operator:</span>
              <span className="font-bold text-slate-900">{offer.operatorName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Bus Category:</span>
              <span className="text-slate-800 font-semibold">{offer.busType.category} • {offer.busType.isAc ? 'AC' : 'Non-AC'}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
              <span className="text-slate-600 font-medium">Final Payable Fare:</span>
              <span className="text-xl font-extrabold text-emerald-700 tabular-nums">
                {formatINR(offer.pricing.finalPriceWithCoupon)}
              </span>
            </div>
          </div>

          {couponCode && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block">Apply this coupon at checkout:</span>
                <span className="text-sm font-extrabold text-emerald-900 font-mono tracking-wider">{couponCode}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          )}

          {offer.provenance === 'DEMO' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Demo Mode Notice:</strong> Real booking API integrations require active commercial agreements. Clicking proceed will open {offer.providerName}&apos;s official homepage for informational purposes.
              </div>
            </div>
          )}

          {/* Affiliate Disclosure */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1 font-semibold text-slate-700 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Affiliate &amp; Partner Disclosure</span>
            </div>
            FareLens is an independent comparison service. We transfer you directly to {offer.providerName} to complete seat selection and payment. We may receive an affiliate referral commission at no additional cost to you.
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={isRedirecting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Proceed to {offer.providerName}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
