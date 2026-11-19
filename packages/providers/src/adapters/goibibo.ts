import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class GoibiboAdapter implements BusProviderAdapter {
  id = 'goibibo';
  name = 'Goibibo';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_GOIBIBO_API_KEY;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    const affiliateId = process.env.PROVIDER_GOIBIBO_AFFILIATE_ID || '';
    return `https://www.goibibo.com/bus/?affId=${encodeURIComponent(affiliateId)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    return {
      providerId: this.id,
      providerName: this.name,
      status: 'NEEDS_CREDENTIALS',
      success: false,
      data: [],
      error: 'Goibibo bus feed credentials not configured.',
      lastUpdatedAt: new Date().toISOString(),
      isDemo: false,
    };
  }
}
