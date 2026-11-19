import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class MakeMyTripAdapter implements BusProviderAdapter {
  id = 'makemytrip';
  name = 'MakeMyTrip';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_MMT_PARTNER_KEY && process.env.PROVIDER_MMT_SECRET;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    const affiliateId = process.env.PROVIDER_MMT_AFFILIATE_ID || '';
    return `https://www.makemytrip.com/bus-tickets/?affId=${encodeURIComponent(affiliateId)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    if (this.status() === 'NEEDS_CREDENTIALS') {
      return {
        providerId: this.id,
        providerName: this.name,
        status: 'NEEDS_CREDENTIALS',
        success: false,
        data: [],
        error: 'MakeMyTrip partner access not configured. Requires official corporate partner credentials or affiliate network setup.',
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
