import { NormalizedBusOffer, ProviderStatus, SearchQuery, Coupon } from '@/core/types/index';

export interface ProviderCapabilities {
  seatCounts: boolean;
  ratings: boolean;
  coupons: boolean;
  boardingPoints: boolean;
  priceBreakdown: boolean;
}

export interface ProviderResult<T> {
  providerId: string;
  providerName: string;
  status: ProviderStatus;
  success: boolean;
  data: T;
  error?: string;
  lastUpdatedAt: string;
  isDemo: boolean;
}

export interface BusProviderAdapter {
  id: string;
  name: string;
  status(): ProviderStatus;
  capabilities: ProviderCapabilities;
  searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>>;
  getCoupons?(context?: { offerId?: string }): Promise<ProviderResult<Coupon[]>>;
  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string;
}
