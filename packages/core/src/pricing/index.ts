import { PriceBreakdown } from '../types';

export interface ComputePricingParams {
  basePrice: number;
  operatorDiscount?: number;
  platformFee?: number;
  convenienceFee?: number;
  taxRatePercent?: number; // default 5% GST
  couponDiscount?: number;
  couponCode?: string;
}

export function computePriceBreakdown(params: ComputePricingParams): PriceBreakdown {
  const basePrice = Math.max(0, Math.round(params.basePrice));
  const operatorDiscount = Math.max(0, Math.round(params.operatorDiscount || 0));
  const taxableAmount = Math.max(0, basePrice - operatorDiscount);
  
  const taxRate = params.taxRatePercent !== undefined ? params.taxRatePercent : 5;
  const taxes = Math.round((taxableAmount * taxRate) / 100);
  
  const platformFee = Math.max(0, Math.round(params.platformFee || 0));
  const convenienceFee = Math.max(0, Math.round(params.convenienceFee || 0));
  
  const finalPriceNoCoupon = Math.max(0, basePrice - operatorDiscount + platformFee + taxes + convenienceFee);
  
  const couponDiscount = Math.min(finalPriceNoCoupon, Math.max(0, Math.round(params.couponDiscount || 0)));
  const finalPriceWithCoupon = finalPriceNoCoupon - couponDiscount;
  
  return {
    basePrice,
    operatorDiscount,
    platformFee,
    taxes,
    convenienceFee,
    finalPriceNoCoupon,
    appliedCoupon: params.couponCode && couponDiscount > 0 ? {
      code: params.couponCode,
      discountAmount: couponDiscount,
    } : undefined,
    finalPriceWithCoupon,
    savings: operatorDiscount + couponDiscount,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
