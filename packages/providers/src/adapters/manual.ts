import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery } from '@/core/types/index';

export class ManualBusAdapter implements BusProviderAdapter {
  id = 'manual-curated';
  name = 'Admin Verified Inventory';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  private curatedOffers: NormalizedBusOffer[] = [];

  constructor(initialOffers?: NormalizedBusOffer[]) {
    if (initialOffers) {
      this.curatedOffers = initialOffers;
    }
  }

  status(): ProviderStatus {
    return 'ACTIVE';
  }

  buildDeepLink(offer: NormalizedBusOffer): string {
    return offer.deepLink || 'https://farelens.in';
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    const from = (query.fromCity || '').toLowerCase();
    const to = (query.toCity || '').toLowerCase();

    // Filter curated offers
    const filtered = this.curatedOffers.filter(o => 
      o.boardingPoints.some(bp => bp.location.toLowerCase().includes(from)) ||
      o.droppingPoints.some(dp => dp.location.toLowerCase().includes(to))
    );

    return {
      providerId: this.id,
      providerName: this.name,
      status: 'ACTIVE',
      success: true,
      data: filtered,
      lastUpdatedAt: new Date().toISOString(),
      isDemo: false,
    };
  }
}
