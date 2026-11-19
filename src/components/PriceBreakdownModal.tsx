'use client';

import React from 'react';
import { X, ShieldCheck, Tag, Info, Receipt } from 'lucide-react';
import { NormalizedBusOffer } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';
import { ProvenanceBadge } from './ProvenanceBadge';

interface PriceBreakdownModalProps {
  offer: NormalizedBusOffer;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceBreakdownModal({ offer, isOpen, onClose }: PriceBreakdownModalProps) {
  if (!isOpen) return null;

  const { pricing } = offer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Final Fare Breakdown</h3>
              <p className="text-xs text-slate-500">{offer.operatorName} • via {offer.providerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Data Provenance</span>
            <ProvenanceBadge provenance={offer.provenance} showDescription />
          </div>

          {/* Mathematical line items */}
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Base Ticket Fare</span>
              <span className="font-semibold text-slate-900 tabular-nums">{formatINR(pricing.basePrice)}</span>
            </div>

            {pricing.operatorDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Operator Instant Discount
                </span>
                <span className="font-semibold tabular-nums">-{formatINR(pricing.operatorDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                GST / Government Taxes (5%)
                <span title="Statutory 5% GST on intercity AC passenger bus transport">
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">+{formatINR(pricing.taxes)}</span>
            </div>

            {pricing.platformFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Platform Service Fee</span>
                <span className="font-semibold text-slate-900 tabular-nums">+{formatINR(pricing.platformFee)}</span>
              </div>
            )}

            {pricing.convenienceFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Payment Gateway / Convenience Fee</span>
                <span className="font-semibold text-slate-900 tabular-nums">+{formatINR(pricing.convenienceFee)}</span>
              </div>
            )}

            {pricing.appliedCoupon && (
              <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Coupon ({pricing.appliedCoupon.code})
                </span>
                <span className="font-bold tabular-nums">-{formatINR(pricing.appliedCoupon.discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Final Payable Amount */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold block">Final Payable Price</span>
              <span className="text-xs text-emerald-600 font-medium">No hidden fees at checkout</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatINR(pricing.finalPriceWithCoupon)}
              </span>
            </div>
          </div>

          {pricing.savings > 0 && (
            <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>You save <strong>{formatINR(pricing.savings)}</strong> compared to standard counter fare.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
