import { AlertRule, City, Coupon, PriceSnapshot } from '@/core/types/index';
import { POPULAR_CITIES, POPULAR_ROUTES, INITIAL_COUPONS, generateSeedSnapshots } from './data/seed';

export interface OutboundClickLog {
  id: string;
  offerId: string;
  providerId: string;
  tripId: string;
  finalPrice: number;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export class FareLensRepository {
  private static instance: FareLensRepository;

  private cities: City[] = [...POPULAR_CITIES];
  private coupons: Coupon[] = [...INITIAL_COUPONS];
  private alerts: AlertRule[] = [
    {
      id: 'alert-sample-1',
      userId: 'user-demo-1',
      userEmail: 'traveller@example.com',
      routeId: 'bangalore-hyderabad',
      fromCity: 'Bangalore',
      toCity: 'Hyderabad',
      journeyDate: '2026-11-25',
      operatorName: 'VRL Travels',
      targetPrice: 1100,
      dropPercentThreshold: 5,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastTriggeredAt: null,
      cooldownMinutes: 180,
    },
    {
      id: 'alert-sample-2',
      userId: 'user-demo-1',
      userEmail: 'traveller@example.com',
      routeId: 'mumbai-pune',
      fromCity: 'Mumbai',
      toCity: 'Pune',
      journeyDate: '2026-11-22',
      targetPrice: 320,
      dropPercentThreshold: 10,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      lastTriggeredAt: null,
      cooldownMinutes: 180,
    }
  ];
  private snapshots: Map<string, PriceSnapshot[]> = new Map();
  private outboundClicks: OutboundClickLog[] = [];
  private searchHistory: { query: any; timestamp: string }[] = [];
  private savedBuses: { id: string; tripData: any; savedAt: string }[] = [];

  private constructor() {
    this.initDefaultSnapshots();
  }

  public static getInstance(): FareLensRepository {
    if (!FareLensRepository.instance) {
      FareLensRepository.instance = new FareLensRepository();
    }
    return FareLensRepository.instance;
  }

  private initDefaultSnapshots() {
    // Seed snapshots for 4 typical canonical trips
    this.snapshots.set('vrl-travels-2115-sleeper-ac', generateSeedSnapshots('vrl-travels-2115-sleeper-ac', 1250, 'PRICE_DROP'));
    this.snapshots.set('orange-travels-2200-sleeper-ac', generateSeedSnapshots('orange-travels-2200-sleeper-ac', 1350, 'RISING'));
    this.snapshots.set('intrcity-smartbus-2045-sleeper-ac', generateSeedSnapshots('intrcity-smartbus-2045-sleeper-ac', 1400, 'STABLE'));
    this.snapshots.set('zingbus-2230-seater-ac', generateSeedSnapshots('zingbus-2230-seater-ac', 850, 'FEW_SNAPSHOTS'));
  }

  // --- CITIES & ROUTES ---
  public searchCities(query: string): City[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.cities.slice(0, 8);

    return this.cities.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.aliases.some(a => a.toLowerCase().includes(q))
    );
  }

  public getPopularRoutes() {
    return POPULAR_ROUTES;
  }

  // --- COUPONS ---
  public getCoupons(options?: { providerId?: string; type?: string; onlyVerified?: boolean }): Coupon[] {
    let result = [...this.coupons];
    if (options?.providerId && options.providerId !== 'ALL') {
      result = result.filter(c => c.providerId === 'ALL' || c.providerId === options.providerId);
    }
    if (options?.type && options.type !== 'ALL') {
      result = result.filter(c => c.type === options.type);
    }
    if (options?.onlyVerified) {
      result = result.filter(c => c.verificationStatus === 'VERIFIED');
    }
    return result;
  }

  public addCoupon(coupon: Omit<Coupon, 'id'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
    };
    this.coupons.unshift(newCoupon);
    return newCoupon;
  }

  public updateCouponStatus(couponId: string, status: Coupon['verificationStatus'], verifiedBy: string): Coupon | null {
    const found = this.coupons.find(c => c.id === couponId);
    if (!found) return null;
    found.verificationStatus = status;
    found.verifiedAt = new Date().toISOString().split('T')[0];
    found.verifiedBy = verifiedBy;
    return found;
  }

  // --- PRICE SNAPSHOTS & HISTORY ---
  public getSnapshotsForTrip(canonicalKey: string, basePriceFallback = 1200): PriceSnapshot[] {
    if (!this.snapshots.has(canonicalKey)) {
      // Deterministically create default historical series if not already present
      this.snapshots.set(canonicalKey, generateSeedSnapshots(canonicalKey, basePriceFallback, 'STABLE'));
    }
    return this.snapshots.get(canonicalKey) || [];
  }

  public recordSnapshot(snapshot: Omit<PriceSnapshot, 'id'>): PriceSnapshot {
    const newSnap: PriceSnapshot = {
      ...snapshot,
      id: `snap-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
    const list = this.snapshots.get(snapshot.tripKey) || [];
    list.push(newSnap);
    this.snapshots.set(snapshot.tripKey, list);
    return newSnap;
  }

  // --- ALERTS ---
  public getAlerts(userId = 'user-demo-1'): AlertRule[] {
    return this.alerts.filter(a => a.userId === userId);
  }

  public createAlert(rule: Omit<AlertRule, 'id' | 'createdAt' | 'status'>): AlertRule {
    const newAlert: AlertRule = {
      ...rule,
      id: `alert-${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      cooldownMinutes: rule.cooldownMinutes || 180,
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  public deleteAlert(alertId: string): boolean {
    const initialLen = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    return this.alerts.length < initialLen;
  }

  // --- OUTBOUND CLICKS & TELEMETRY ---
  public logOutboundClick(click: Omit<OutboundClickLog, 'id' | 'timestamp'>): OutboundClickLog {
    const entry: OutboundClickLog = {
      ...click,
      id: `clk-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.outboundClicks.unshift(entry);
    return entry;
  }

  public getOutboundClicks(): OutboundClickLog[] {
    return this.outboundClicks.slice(0, 50);
  }

  // --- SEARCH HISTORY ---
  public logSearch(query: any): void {
    this.searchHistory.unshift({
      query,
      timestamp: new Date().toISOString(),
    });
    if (this.searchHistory.length > 20) {
      this.searchHistory.pop();
    }
  }

  public getSearchHistory() {
    return this.searchHistory;
  }

  // --- SAVED BUSES ---
  public toggleSaveBus(tripData: any): { isSaved: boolean } {
    const existingIndex = this.savedBuses.findIndex(b => b.id === tripData.id);
    if (existingIndex >= 0) {
      this.savedBuses.splice(existingIndex, 1);
      return { isSaved: false };
    } else {
      this.savedBuses.unshift({
        id: tripData.id,
        tripData,
        savedAt: new Date().toISOString(),
      });
      return { isSaved: true };
    }
  }

  public getSavedBuses() {
    return this.savedBuses;
  }
}
