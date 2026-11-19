import { describe, it, expect } from 'vitest';
import { ProviderRegistry } from '../src/registry';
import { DemoBusAdapter } from '../src/adapters/demo';
import { RedBusAdapter } from '../src/adapters/redbus';
import { groupOffersIntoCanonicalTrips } from '../src/normalizer';

describe('Provider Registry & Adapters', () => {
  it('registers adapters and enforces demo provenance on demo adapter', async () => {
    const registry = ProviderRegistry.getInstance();
    const demoAdapter = registry.getAdapter('demo-provider');
    expect(demoAdapter).toBeDefined();
    expect(demoAdapter?.status()).toBe('DEMO');

    const result = await demoAdapter!.searchBuses({
      fromCity: 'Bangalore',
      toCity: 'Hyderabad',
      journeyDate: '2026-11-25',
      passengers: 1,
    });

    expect(result.success).toBe(true);
    expect(result.isDemo).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    // Every single demo offer must have provenance = DEMO
    result.data.forEach((offer) => {
      expect(offer.provenance).toBe('DEMO');
    });
  });

  it('marks unconfigured real adapters as NEEDS_CREDENTIALS without breaking search', async () => {
    const redbus = new RedBusAdapter();
    expect(redbus.status()).toBe('NEEDS_CREDENTIALS');

    const searchRes = await redbus.searchBuses({
      fromCity: 'Bangalore',
      toCity: 'Hyderabad',
      journeyDate: '2026-11-25',
      passengers: 1,
    });

    expect(searchRes.success).toBe(false);
    expect(searchRes.status).toBe('NEEDS_CREDENTIALS');
    expect(searchRes.error).toContain('API credentials not configured');
  });

  it('groups multiple provider offers into canonical trips and identifies cheapest offer', async () => {
    const registry = ProviderRegistry.getInstance();
    const searchRes = await registry.searchAll({
      fromCity: 'Bangalore',
      toCity: 'Hyderabad',
      journeyDate: '2026-11-25',
      passengers: 1,
    });

    expect(searchRes.canonicalTrips.length).toBeGreaterThan(0);
    expect(searchRes.totalOffers).toBeGreaterThan(searchRes.canonicalTrips.length);

    // Each canonical trip should contain offers and identify the cheapest final price
    searchRes.canonicalTrips.forEach((trip) => {
      expect(trip.offers.length).toBeGreaterThan(0);
      const lowestInOffers = Math.min(...trip.offers.map((o) => o.pricing.finalPriceWithCoupon));
      expect(trip.cheapestOffer.pricing.finalPriceWithCoupon).toBe(lowestInOffers);
    });
  });
});
