import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class B2BAggregatorAdapter implements BusProviderAdapter {
  id = 'aggregator-gds';
  name = 'B2B GDS Aggregator';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: false,
    coupons: false,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_AGGREGATOR_BASE_URL && process.env.PROVIDER_AGGREGATOR_API_KEY;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    return `https://partner.busaggregator.com/book?offer=${encodeURIComponent(offer.id)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    return {
      providerId: this.id,
      providerName: this.name,
      status: 'NEEDS_CREDENTIALS',
      success: false,
      data: [],
      error: 'B2B Inventory Aggregator credentials not configured.',
      lastUpdatedAt: new Date().toISOString(),
      isDemo: false,
    };
  }
}
