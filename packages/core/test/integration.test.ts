import { describe, it, expect } from 'vitest';
import { ProviderRegistry } from '../../providers/src/registry';
import { FareLensRepository } from '../../db/src/repository';
import { CouponEngine } from '../src/coupons';
import { RecommendationEngine } from '../src/recommendation';
import { computePriceBreakdown } from '../src/pricing';

describe('End-to-End User Journeys & Integrity Verification', () => {
  it('E2E Journey 1: Search Bangalore -> Hyderabad returns comparison with final payable prices', async () => {
    const registry = ProviderRegistry.getInstance();
    const results = await registry.searchAll({
      fromCity: 'Bangalore',
      toCity: 'Hyderabad',
      journeyDate: '2026-11-25',
      passengers: 1,
    });

    expect(results.canonicalTrips.length).toBeGreaterThan(0);
    expect(results.fromCity).toBe('Bangalore');
    expect(results.toCity).toBe('Hyderabad');

    // Verify highlights exist
    const hasCheapest = results.canonicalTrips.some((t) => t.highlights.includes('CHEAPEST'));
    expect(hasCheapest).toBe(true);

    // Verify every offer has mathematical precision
    for (const trip of results.canonicalTrips) {
      for (const offer of trip.offers) {
        const { pricing } = offer;
        const expectedFinal = pricing.basePrice - pricing.operatorDiscount + pricing.platformFee + pricing.taxes + pricing.convenienceFee;
        expect(pricing.finalPriceNoCoupon).toBe(expectedFinal);
        expect(pricing.finalPriceWithCoupon).toBeLessThanOrEqual(pricing.finalPriceNoCoupon);
      }
    }
  });

  it('E2E Journey 2: Data Provenance Enforcement (No mock is disguised as live)', async () => {
    const registry = ProviderRegistry.getInstance();
    const results = await registry.searchAll({
      fromCity: 'Mumbai',
      toCity: 'Pune',
      journeyDate: '2026-11-22',
      passengers: 1,
    });

    // In demo mode, all returned offers MUST carry DEMO provenance
    for (const trip of results.canonicalTrips) {
      for (const offer of trip.offers) {
        if (offer.providerId.startsWith('demo-')) {
          expect(offer.provenance).toBe('DEMO');
        }
      }
    }

    // Providers that lack credentials must report NEEDS_CREDENTIALS
    const redbusStatus = results.providerStatuses.find((p) => p.id === 'redbus');
    expect(redbusStatus?.status).toBe('NEEDS_CREDENTIALS');
  });

  it('E2E Journey 3: Coupon Engine calculates best bank and wallet scenarios with caps', () => {
    const repo = FareLensRepository.getInstance();
    const coupons = repo.getCoupons();
    expect(coupons.length).toBeGreaterThan(0);

    const dummyOffer = {
      id: 'test-1',
      tripId: 'trip-1',
      providerId: 'demo-abhibus',
      providerName: 'AbhiBus',
      operatorName: 'Orange Travels',
      busType: { category: 'SLEEPER' as const, isAc: true },
      departsAt: new Date().toISOString(),
      arrivesAt: new Date().toISOString(),
      durationMinutes: 480,
      pricing: computePriceBreakdown({
        basePrice: 1500,
        platformFee: 15,
        convenienceFee: 10,
        taxRatePercent: 5,
      }),
      amenities: [],
      boardingPoints: [],
      droppingPoints: [],
      deepLink: 'https://example.com',
      provenance: 'DEMO' as const,
      fetchedAt: new Date().toISOString(),
    };

    // ABHIHDFC gives 15% up to ₹250 on HDFC cards
    const hdfcCalc = CouponEngine.calculateBestCoupon(coupons, dummyOffer, {
      paymentMethod: 'HDFC_CREDIT_CARD',
      isFirstTimeUser: false,
    });

    expect(hdfcCalc.bestCoupon?.code).toBe('ABHIHDFC');
    // 15% of 1600 = 240
    expect(hdfcCalc.bestDiscount).toBe(240);
    expect(hdfcCalc.finalPrice).toBe(dummyOffer.pricing.finalPriceNoCoupon - 240);
  });

  it('E2E Journey 4: Recommendation Engine Insufficient Data fallback exact wording', () => {
    const recommendation = RecommendationEngine.recommend({
      currentFinalPrice: 1200,
      snapshots: [], // Zero snapshots
      daysToDeparture: 4,
      provenance: 'DEMO',
    });

    expect(recommendation.verdict).toBe('INSUFFICIENT_DATA');
    expect(recommendation.explanation[0]).toBe(
      'Not enough booking history to make a reliable prediction. Compare current prices and book according to your preference.'
    );
  });

  it('E2E Journey 5: Price Tracking & Alert Rule Lifecycle', () => {
    const repo = FareLensRepository.getInstance();
    
    // Create alert
    const alert = repo.createAlert({
      userId: 'test-user',
      userEmail: 'user@example.com',
      routeId: 'delhi-jaipur',
      fromCity: 'Delhi',
      toCity: 'Jaipur',
      journeyDate: '2026-11-28',
      targetPrice: 450,
      dropPercentThreshold: 10,
      cooldownMinutes: 180,
    });

    expect(alert.id).toBeDefined();
    expect(alert.status).toBe('ACTIVE');

    // List alerts
    const userAlerts = repo.getAlerts('test-user');
    expect(userAlerts.length).toBe(1);
    expect(userAlerts[0].fromCity).toBe('Delhi');

    // Delete alert
    const deleted = repo.deleteAlert(alert.id);
    expect(deleted).toBe(true);
    expect(repo.getAlerts('test-user').length).toBe(0);
  });
});
