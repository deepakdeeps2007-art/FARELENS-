import { describe, it, expect } from 'vitest';
import { computePriceBreakdown } from '../src/pricing';
import { CouponEngine } from '../src/coupons';
import { RecommendationEngine } from '../src/recommendation';
import { Coupon, NormalizedBusOffer, PriceSnapshot } from '../src/types';

describe('Pricing Engine', () => {
  it('correctly calculates base price with 5% GST and fees', () => {
    const result = computePriceBreakdown({
      basePrice: 1000,
      operatorDiscount: 100,
      platformFee: 25,
      convenienceFee: 15,
      taxRatePercent: 5,
    });

    // Taxable: 1000 - 100 = 900
    // Tax: 5% of 900 = 45
    // Final no coupon: 900 + 25 + 45 + 15 = 985
    expect(result.basePrice).toBe(1000);
    expect(result.operatorDiscount).toBe(100);
    expect(result.taxes).toBe(45);
    expect(result.platformFee).toBe(25);
    expect(result.convenienceFee).toBe(15);
    expect(result.finalPriceNoCoupon).toBe(985);
    expect(result.finalPriceWithCoupon).toBe(985);
  });

  it('correctly applies coupon discount without exceeding total price', () => {
    const result = computePriceBreakdown({
      basePrice: 500,
      platformFee: 20,
      convenienceFee: 10,
      taxRatePercent: 5, // 25
      couponDiscount: 150,
      couponCode: 'SAVE150',
    });

    // 500 + 25 + 20 + 10 = 555
    expect(result.finalPriceNoCoupon).toBe(555);
    expect(result.finalPriceWithCoupon).toBe(405);
    expect(result.appliedCoupon?.code).toBe('SAVE150');
    expect(result.appliedCoupon?.discountAmount).toBe(150);
  });
});

describe('Coupon Engine', () => {
  const dummyOffer: NormalizedBusOffer = {
    id: 'test-offer-1',
    tripId: 'trip-1',
    providerId: 'demo-redbus',
    providerName: 'redBus (Demo)',
    operatorName: 'VRL Travels',
    busType: { category: 'SLEEPER', isAc: true },
    departsAt: new Date(Date.now() + 86400000).toISOString(),
    arrivesAt: new Date(Date.now() + 86400000 + 28800000).toISOString(),
    durationMinutes: 480,
    pricing: {
      basePrice: 1200,
      operatorDiscount: 0,
      platformFee: 25,
      taxes: 60,
      convenienceFee: 15,
      finalPriceNoCoupon: 1300,
      finalPriceWithCoupon: 1300,
      savings: 0,
    },
    amenities: ['WiFi', 'Charging Point'],
    boardingPoints: [],
    droppingPoints: [],
    deepLink: 'https://example.com/book',
    provenance: 'DEMO',
    fetchedAt: new Date().toISOString(),
  };

  const sampleCoupons: Coupon[] = [
    {
      id: 'c1',
      providerId: 'demo-redbus',
      providerName: 'redBus (Demo)',
      code: 'FIRSTBUS',
      title: 'First Booking Flat ₹150 Off',
      description: 'Get flat ₹150 off on your first bus booking',
      type: 'FIRST_TIME',
      discountType: 'FLAT',
      discountValue: 150,
      minAmount: 500,
      paymentMethods: ['ALL'],
      validFrom: '2026-01-01',
      validTo: '2027-12-31',
      source: 'AFFILIATE_FEED',
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-11-18',
      verifiedBy: 'system',
    },
    {
      id: 'c2',
      providerId: 'demo-redbus',
      providerName: 'redBus (Demo)',
      code: 'HDFC200',
      title: 'HDFC Cards 15% Off Up to ₹200',
      description: 'Save 15% up to ₹200 on HDFC Credit/Debit cards',
      type: 'BANK',
      discountType: 'PERCENT',
      discountValue: 15,
      maxDiscount: 200,
      minAmount: 1000,
      paymentMethods: ['HDFC_CREDIT_CARD', 'HDFC_DEBIT_CARD'],
      validFrom: '2026-01-01',
      validTo: '2027-12-31',
      source: 'PARTNER_PAGE',
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-11-18',
      verifiedBy: 'admin',
    },
    {
      id: 'c3',
      providerId: 'demo-redbus',
      providerName: 'redBus (Demo)',
      code: 'HIGHMIN',
      title: '₹500 off on ₹2500',
      description: 'Minimum ₹2500 required',
      type: 'PUBLIC',
      discountType: 'FLAT',
      discountValue: 500,
      minAmount: 2500,
      paymentMethods: ['ALL'],
      validFrom: '2026-01-01',
      validTo: '2027-12-31',
      source: 'PUBLIC_PROMO',
      verificationStatus: 'VERIFIED',
      verifiedAt: '2026-11-18',
      verifiedBy: 'admin',
    },
  ];

  it('evaluates eligibility and ineligibility reasons', () => {
    // c3 requires 2500, offer is 1300
    const evalHighMin = CouponEngine.evaluateCoupon(sampleCoupons[2], dummyOffer);
    expect(evalHighMin.isEligible).toBe(false);
    expect(evalHighMin.ineligibilityReason).toContain('Requires minimum booking amount of ₹2500');

    // c1 is first time
    const evalFirstTime = CouponEngine.evaluateCoupon(sampleCoupons[0], dummyOffer, { isFirstTimeUser: true });
    expect(evalFirstTime.isEligible).toBe(true);
    expect(evalFirstTime.calculatedDiscount).toBe(150);
    expect(evalFirstTime.finalPriceWithCoupon).toBe(1150);
  });

  it('selects best coupon for payment method with caps', () => {
    // 15% of 1300 = 195 (cap is 200, so 195 applies)
    const resultHDFC = CouponEngine.calculateBestCoupon(sampleCoupons, dummyOffer, {
      paymentMethod: 'HDFC_CREDIT_CARD',
      isFirstTimeUser: false,
    });

    expect(resultHDFC.bestCoupon?.code).toBe('HDFC200');
    expect(resultHDFC.bestDiscount).toBe(195);
    expect(resultHDFC.finalPrice).toBe(1105);
  });
});

describe('Recommendation Engine', () => {
  it('returns exact INSUFFICIENT_DATA copy when fewer than minimum snapshots exist', () => {
    const recommendation = RecommendationEngine.recommend({
      currentFinalPrice: 1200,
      snapshots: [
        {
          id: 's1',
          offerKey: 'k1',
          providerId: 'p1',
          tripKey: 'tk1',
          routeId: 'blr-hyd',
          journeyDate: '2026-11-25',
          basePrice: 1100,
          finalPrice: 1200,
          capturedAt: new Date(Date.now() - 3600000).toISOString(),
          provenance: 'HISTORICAL',
        },
      ],
      daysToDeparture: 5,
      provenance: 'DEMO',
    });

    expect(recommendation.verdict).toBe('INSUFFICIENT_DATA');
    expect(recommendation.confidence).toBe('LOW');
    expect(recommendation.explanation[0]).toBe(
      'Not enough booking history to make a reliable prediction. Compare current prices and book according to your preference.'
    );
  });

  it('detects PRICE_DROP_DETECTED when price drops by >= 3%', () => {
    const now = Date.now();
    const snapshots: PriceSnapshot[] = [
      { id: '1', offerKey: 'o', providerId: 'p', tripKey: 't', routeId: 'r', journeyDate: 'd', basePrice: 1500, finalPrice: 1500, capturedAt: new Date(now - 72 * 3600000).toISOString(), provenance: 'HISTORICAL' },
      { id: '2', offerKey: 'o', providerId: 'p', tripKey: 't', routeId: 'r', journeyDate: 'd', basePrice: 1500, finalPrice: 1500, capturedAt: new Date(now - 60 * 3600000).toISOString(), provenance: 'HISTORICAL' },
      { id: '3', offerKey: 'o', providerId: 'p', tripKey: 't', routeId: 'r', journeyDate: 'd', basePrice: 1450, finalPrice: 1450, capturedAt: new Date(now - 48 * 3600000).toISOString(), provenance: 'HISTORICAL' },
      { id: '4', offerKey: 'o', providerId: 'p', tripKey: 't', routeId: 'r', journeyDate: 'd', basePrice: 1400, finalPrice: 1400, capturedAt: new Date(now - 24 * 3600000).toISOString(), provenance: 'HISTORICAL' },
      { id: '5', offerKey: 'o', providerId: 'p', tripKey: 't', routeId: 'r', journeyDate: 'd', basePrice: 1400, finalPrice: 1400, capturedAt: new Date(now - 2 * 3600000).toISOString(), provenance: 'HISTORICAL' },
    ];

    // Current price is 1250 (1400 -> 1250 is -10.7% drop)
    const recommendation = RecommendationEngine.recommend({
      currentFinalPrice: 1250,
      snapshots,
      daysToDeparture: 3,
      provenance: 'DEMO',
    });

    expect(recommendation.verdict).toBe('PRICE_DROP_DETECTED');
    expect(recommendation.explanation[0]).toContain('Price dropped');
  });

  it('recommends HIGH_DEMAND_BOOK_NOW when seats are low or occupancy is high', () => {
    const now = Date.now();
    const snapshots: PriceSnapshot[] = Array.from({ length: 6 }).map((_, i) => ({
      id: `s-${i}`,
      offerKey: 'o',
      providerId: 'p',
      tripKey: 't',
      routeId: 'r',
      journeyDate: 'd',
      basePrice: 1200,
      finalPrice: 1200,
      capturedAt: new Date(now - (60 - i * 10) * 3600000).toISOString(),
      provenance: 'HISTORICAL' as const,
    }));

    const recommendation = RecommendationEngine.recommend({
      currentFinalPrice: 1200,
      snapshots,
      seatsAvailable: 4,
      totalSeats: 36, // 32 booked = ~89% occupancy, seats <= 6
      daysToDeparture: 1,
      provenance: 'DEMO',
    });

    expect(recommendation.verdict).toBe('HIGH_DEMAND_BOOK_NOW');
    expect(recommendation.confidence).toBe('HIGH');
  });
});
