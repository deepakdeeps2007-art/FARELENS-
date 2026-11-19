import { BusProviderAdapter, ProviderResult } from './interface';
import { DemoBusAdapter } from './adapters/demo';
import { ManualBusAdapter } from './adapters/manual';
import { RedBusAdapter } from './adapters/redbus';
import { AbhiBusAdapter } from './adapters/abhibus';
import { MakeMyTripAdapter } from './adapters/makemytrip';
import { GoibiboAdapter } from './adapters/goibibo';
import { PaytmAdapter } from './adapters/paytm';
import { B2BAggregatorAdapter } from './adapters/aggregator';
import { CanonicalBusTrip, NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';
import { groupOffersIntoCanonicalTrips } from './normalizer';

export interface SearchAggregatedResult {
  canonicalTrips: CanonicalBusTrip[];
  rawOffers: NormalizedBusOffer[];
  providerStatuses: {
    id: string;
    name: string;
    status: ProviderStatus;
    offerCount: number;
    error?: string;
    isDemo: boolean;
  }[];
  totalOffers: number;
  totalTrips: number;
  fromCity: string;
  toCity: string;
  journeyDate: string;
  executedAt: string;
  durationMs: number;
  isAllDemo: boolean;
}

export class ProviderRegistry {
  private adapters: Map<string, BusProviderAdapter> = new Map();
  private static instance: ProviderRegistry;

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  private registerDefaults() {
    // Demo adapter
    this.register(new DemoBusAdapter());
    // Manual curated adapter
    this.register(new ManualBusAdapter());
    // Stubs
    this.register(new RedBusAdapter());
    this.register(new AbhiBusAdapter());
    this.register(new MakeMyTripAdapter());
    this.register(new GoibiboAdapter());
    this.register(new PaytmAdapter());
    this.register(new B2BAggregatorAdapter());
  }

  public register(adapter: BusProviderAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getAdapter(id: string): BusProviderAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAllAdapters(): BusProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Searches across all active/demo providers in parallel with timeouts and circuit-breaker isolation.
   */
  public async searchAll(query: SearchQuery): Promise<SearchAggregatedResult> {
    const startTime = Date.now();
    const adapters = this.getAllAdapters();
    const TIMEOUT_MS = 8000;

    const timeoutPromise = <T>(promise: Promise<T>, ms: number, providerId: string): Promise<T> => {
      let timeoutHandle: any;
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Provider ${providerId} timed out after ${ms}ms`));
        }, ms);
      });
      return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutHandle));
    };

    const searchPromises = adapters.map(async (adapter) => {
      const status = adapter.status();
      if (status === 'NEEDS_CREDENTIALS') {
        return {
          id: adapter.id,
          name: adapter.name,
          status,
          offers: [] as NormalizedBusOffer[],
          error: `${adapter.name} API integration not configured (Requires official credentials).`,
          isDemo: false,
        };
      }

      try {
        const result = await timeoutPromise(adapter.searchBuses(query), TIMEOUT_MS, adapter.id);
        return {
          id: adapter.id,
          name: adapter.name,
          status: result.status,
          offers: result.data || [],
          error: result.error,
          isDemo: result.isDemo,
        };
      } catch (err: any) {
        return {
          id: adapter.id,
          name: adapter.name,
          status: 'NOT_AVAILABLE' as ProviderStatus,
          offers: [] as NormalizedBusOffer[],
          error: err.message || 'Failed to fetch provider inventory',
          isDemo: false,
        };
      }
    });

    const settled = await Promise.all(searchPromises);

    const allOffers: NormalizedBusOffer[] = [];
    const providerStatuses: SearchAggregatedResult['providerStatuses'] = [];

    let demoCount = 0;
    let liveCount = 0;

    for (const res of settled) {
      if (res.offers && res.offers.length > 0) {
        allOffers.push(...res.offers);
        if (res.isDemo) demoCount += res.offers.length;
        else liveCount += res.offers.length;
      }
      providerStatuses.push({
        id: res.id,
        name: res.name,
        status: res.status,
        offerCount: res.offers ? res.offers.length : 0,
        error: res.error,
        isDemo: res.isDemo,
      });
    }

    const canonicalTrips = groupOffersIntoCanonicalTrips(
      allOffers,
      query.fromCity || 'Bangalore',
      query.toCity || 'Hyderabad'
    );

    const durationMs = Date.now() - startTime;

    return {
      canonicalTrips,
      rawOffers: allOffers,
      providerStatuses,
      totalOffers: allOffers.length,
      totalTrips: canonicalTrips.length,
      fromCity: query.fromCity,
      toCity: query.toCity,
      journeyDate: query.journeyDate,
      executedAt: new Date().toISOString(),
      durationMs,
      isAllDemo: liveCount === 0 && demoCount > 0,
    };
  }
}
