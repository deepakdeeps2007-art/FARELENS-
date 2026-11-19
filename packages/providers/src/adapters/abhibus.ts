import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class AbhiBusAdapter implements BusProviderAdapter {
  id = 'abhibus';
  name = 'AbhiBus';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_ABHIBUS_API_KEY && process.env.PROVIDER_ABHIBUS_SECRET;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    const affiliateId = process.env.PROVIDER_ABHIBUS_AFFILIATE_ID || '';
    return `https://www.abhibus.com/bus_search?affiliate=${encodeURIComponent(affiliateId)}&ref=${encodeURIComponent(offer.id)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    if (this.status() === 'NEEDS_CREDENTIALS') {
      return {
        providerId: this.id,
        providerName: this.name,
        status: 'NEEDS_CREDENTIALS',
        success: false,
        data: [],
        error: 'AbhiBus partner credentials missing. Set PROVIDER_ABHIBUS_API_KEY in environment variables.',
        lastUpdatedAt: new Date().toISOString(),
        isDemo: false,
      };
    }

    return {
      providerId: this.id,
      providerName: this.name,
      status: 'ACTIVE',
      success: true,
      data: [],
      lastUpdatedAt: new Date().toISOString(),
      isDemo: false,
    };
  }
}
