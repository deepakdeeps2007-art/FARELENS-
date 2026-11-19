import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class PaytmAdapter implements BusProviderAdapter {
  id = 'paytm';
  name = 'Paytm Bus';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_PAYTM_CLIENT_ID && process.env.PROVIDER_PAYTM_SECRET;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    const affiliateId = process.env.PROVIDER_PAYTM_AFFILIATE_ID || '';
    return `https://paytm.com/bus-tickets?aff=${encodeURIComponent(affiliateId)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    return {
      providerId: this.id,
      providerName: this.name,
      status: 'NEEDS_CREDENTIALS',
      success: false,
      data: [],
      error: 'Paytm Bus Partner credentials not configured.',
      lastUpdatedAt: new Date().toISOString(),
      isDemo: false,
    };
  }
}
