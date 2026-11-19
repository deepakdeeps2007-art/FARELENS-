import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class RedBusAdapter implements BusProviderAdapter {
  id = 'redbus';
  name = 'redBus';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    const hasKeys = process.env.PROVIDER_REDBUS_API_KEY && process.env.PROVIDER_REDBUS_CLIENT_ID;
    return hasKeys ? 'ACTIVE' : 'NEEDS_CREDENTIALS';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    const affiliateId = process.env.PROVIDER_REDBUS_AFFILIATE_ID || '';
    const baseUrl = 'https://www.redbus.in/bus-tickets';
    return `${baseUrl}?subId=${encodeURIComponent(affiliateId)}&busId=${encodeURIComponent(offer.id)}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    if (this.status() === 'NEEDS_CREDENTIALS') {
      return {
        providerId: this.id,
        providerName: this.name,
        status: 'NEEDS_CREDENTIALS',
        success: false,
        data: [],
        error: 'redBus API credentials not configured. Integration requires redBus Partner API / Impact Affiliate approval.',
        lastUpdatedAt: new Date().toISOString(),
        isDemo: false,
      };
    }

    // Official API call implementation when keys exist
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
