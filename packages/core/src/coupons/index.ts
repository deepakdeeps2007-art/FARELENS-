import { Coupon, NormalizedBusOffer, PriceBreakdown } from '../types';
import { computePriceBreakdown } from '../pricing';

export interface CouponEvaluationResult {
  coupon: Coupon;
  isEligible: boolean;
  ineligibilityReason?: string;
  calculatedDiscount: number;
  finalPriceWithCoupon: number;
  isBestOffer: boolean;
}

export interface CouponBestCalculationResult {
  offerId: string;
  originalPrice: number;
  bestCoupon?: Coupon;
  bestDiscount: number;
  finalPrice: number;
  evaluatedCoupons: CouponEvaluationResult[];
  scenarios: {
    category: string;
    coupon?: Coupon;
    discount: number;
    finalPrice: number;
  }[];
}

export interface CouponUserContext {
  isFirstTimeUser?: boolean;
  isStudent?: boolean;
  paymentMethod?: string; // 'ALL', 'HDFC_CREDIT_CARD', 'ICICI_NETBANKING', 'CRED_UPI', 'AMEX', etc.
}

export class CouponEngine {
  /**
   * Evaluates a single coupon against an offer and user context.
   */
  static evaluateCoupon(
    coupon: Coupon,
    offer: NormalizedBusOffer,
    context: CouponUserContext = {}
  ): CouponEvaluationResult {
    const basePayable = offer.pricing.finalPriceNoCoupon;
    const now = new Date();
    
    // Check expiration
    if (coupon.validTo && new Date(coupon.validTo) < now) {
      return {
        coupon,
        isEligible: false,
        ineligibilityReason: 'Coupon has expired',
        calculatedDiscount: 0,
        finalPriceWithCoupon: basePayable,
        isBestOffer: false,
      };
    }

    // Check verification status
    if (coupon.verificationStatus === 'EXPIRED') {
      return {
        coupon,
        isEligible: false,
        ineligibilityReason: 'Coupon is marked expired by administrator',
        calculatedDiscount: 0,
        finalPriceWithCoupon: basePayable,
        isBestOffer: false,
      };
    }

    // Provider scope check (coupon must match provider or be 'ALL')
    if (coupon.providerId !== 'ALL' && coupon.providerId !== offer.providerId) {
      return {
        coupon,
        isEligible: false,
        ineligibilityReason: `Valid only on ${coupon.providerName}, not on ${offer.providerName}`,
        calculatedDiscount: 0,
        finalPriceWithCoupon: basePayable,
        isBestOffer: false,
      };
    }

    // Min amount check
    if (coupon.minAmount && basePayable < coupon.minAmount) {
      return {
        coupon,
        isEligible: false,
        ineligibilityReason: `Requires minimum booking amount of ₹${coupon.minAmount} (current ₹${basePayable})`,
        calculatedDiscount: 0,
        finalPriceWithCoupon: basePayable,
        isBestOffer: false,
      };
    }

    // Payment method check
    if (context.paymentMethod && context.paymentMethod !== 'ALL') {
      const allowsMethod = 
        coupon.paymentMethods.includes('ALL') || 
        coupon.paymentMethods.includes(context.paymentMethod);
      
      if (!allowsMethod) {
        return {
          coupon,
          isEligible: false,
          ineligibilityReason: `Valid only with payment methods: ${coupon.paymentMethods.join(', ')}`,
          calculatedDiscount: 0,
          finalPriceWithCoupon: basePayable,
          isBestOffer: false,
        };
      }
    }

    // First time user check
    if (coupon.type === 'FIRST_TIME' && context.isFirstTimeUser === false) {
      return {
        coupon,
        isEligible: false,
        ineligibilityReason: 'Applicable only for first-time bookings',
        calculatedDiscount: 0,
        finalPriceWithCoupon: basePayable,
        isBestOffer: false,
      };
    }

    // Calculate discount value
    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      const rawDiscount = (basePayable * coupon.discountValue) / 100;
      discount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
    } else {
      // FLAT
      discount = coupon.discountValue;
    }

    // Ensure discount does not exceed payable
    discount = Math.min(basePayable, Math.round(discount));
    const finalPriceWithCoupon = Math.max(0, basePayable - discount);

    return {
      coupon,
      isEligible: true,
      calculatedDiscount: discount,
      finalPriceWithCoupon,
      isBestOffer: false,
    };
  }

  /**
   * Evaluates all coupons, determines the best coupon, and creates comparison scenarios.
   */
  static calculateBestCoupon(
    coupons: Coupon[],
    offer: NormalizedBusOffer,
    context: CouponUserContext = {}
  ): CouponBestCalculationResult {
    const originalPrice = offer.pricing.finalPriceNoCoupon;
    const evaluatedCoupons = coupons.map((c) => this.evaluateCoupon(c, offer, context));

    const eligible = evaluatedCoupons.filter((r) => r.isEligible && r.calculatedDiscount > 0);
    eligible.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    let bestCoupon: Coupon | undefined;
    let bestDiscount = 0;

    if (eligible.length > 0) {
      eligible[0].isBestOffer = true;
      bestCoupon = eligible[0].coupon;
      bestDiscount = eligible[0].calculatedDiscount;
    }

    // Scenarios:
    // 1. Without Coupon
    // 2. Best Public Coupon
    // 3. Best Bank / Card Coupon
    // 4. Best Wallet / UPI Coupon
    const publicCoupons = evaluatedCoupons.filter(
      (e) => e.isEligible && (e.coupon.type === 'PUBLIC' || e.coupon.type === 'PLATFORM')
    );
    publicCoupons.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    const bankCoupons = evaluatedCoupons.filter(
      (e) => e.isEligible && e.coupon.type === 'BANK'
    );
    bankCoupons.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    const walletCoupons = evaluatedCoupons.filter(
      (e) => e.isEligible && e.coupon.type === 'WALLET'
    );
    walletCoupons.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

    const scenarios = [
      {
        category: 'Standard Fare (No Coupon)',
        coupon: undefined,
        discount: 0,
        finalPrice: originalPrice,
      },
      {
        category: 'Best Public Promo',
        coupon: publicCoupons[0]?.coupon,
        discount: publicCoupons[0]?.calculatedDiscount || 0,
        finalPrice: originalPrice - (publicCoupons[0]?.calculatedDiscount || 0),
      },
      {
        category: 'Best Bank / Credit Card Offer',
        coupon: bankCoupons[0]?.coupon,
        discount: bankCoupons[0]?.calculatedDiscount || 0,
        finalPrice: originalPrice - (bankCoupons[0]?.calculatedDiscount || 0),
      },
      {
        category: 'Best Wallet / UPI Offer',
        coupon: walletCoupons[0]?.coupon,
        discount: walletCoupons[0]?.calculatedDiscount || 0,
        finalPrice: originalPrice - (walletCoupons[0]?.calculatedDiscount || 0),
      },
    ];

    return {
      offerId: offer.id,
      originalPrice,
      bestCoupon,
      bestDiscount,
      finalPrice: Math.max(0, originalPrice - bestDiscount),
      evaluatedCoupons,
      scenarios,
    };
  }
}
