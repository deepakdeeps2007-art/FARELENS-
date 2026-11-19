export type Provenance = 
  | 'LIVE_VERIFIED' 
  | 'RECENT' 
  | 'HISTORICAL' 
  | 'ESTIMATED' 
  | 'DEMO';

export type ProviderStatus = 
  | 'ACTIVE' 
  | 'NEEDS_CREDENTIALS' 
  | 'NOT_AVAILABLE' 
  | 'DEMO';

export type BusCategory = 'SLEEPER' | 'SEATER' | 'SEMI_SLEEPER';

export interface BusTypeInfo {
  category: BusCategory;
  isAc: boolean;
  model?: string; // Volvo, Scania, BharatBenz, Mercedes, Ashok Leyland
  seatLayout?: string; // '2+1', '2+2'
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface BoardingPoint {
  id: string;
  name: string;
  location: string;
  time: string;
  landmark?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  operatorDiscount: number;
  platformFee: number;
  taxes: number; // GST 5% on AC/Intercity
  convenienceFee: number;
  finalPriceNoCoupon: number;
  appliedCoupon?: {
    code: string;
    discountAmount: number;
  };
  finalPriceWithCoupon: number;
  savings: number;
}

export interface NormalizedBusOffer {
  id: string;
  tripId: string;
  providerId: string;
  providerName: string;
  providerLogo?: string;
  operatorName: string;
  busType: BusTypeInfo;
  departsAt: string; // ISO string
  arrivesAt: string; // ISO string
  durationMinutes: number;
  pricing: PriceBreakdown;
  seatsAvailable?: number | null;
  totalSeats?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  droppingPoints: BoardingPoint[];
  deepLink: string;
  provenance: Provenance;
  fetchedAt: string; // ISO string
  isDirectBooking?: boolean;
}

export interface CanonicalBusTrip {
  id: string;
  canonicalKey: string;
  routeId: string;
  fromCity: string;
  toCity: string;
  operatorName: string;
  busType: BusTypeInfo;
  departsAt: string;
  arrivesAt: string;
  durationMinutes: number;
  amenities: string[];
  boardingPoints: BoardingPoint[];
  droppingPoints: BoardingPoint[];
  offers: NormalizedBusOffer[];
  cheapestOffer: NormalizedBusOffer;
  bestValueOffer?: NormalizedBusOffer;
  fastestOffer?: NormalizedBusOffer;
  bestCouponOffer?: NormalizedBusOffer;
  highlights: ('CHEAPEST' | 'FASTEST' | 'BEST_RATED' | 'BEST_COUPON' | 'BEST_VALUE')[];
}

export type CouponType = 
  | 'PUBLIC' 
  | 'BANK' 
  | 'WALLET' 
  | 'FIRST_TIME' 
  | 'PLATFORM' 
  | 'PERSONALISED';

export type DiscountType = 'PERCENT' | 'FLAT';

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';

export interface Coupon {
  id: string;
  providerId: string;
  providerName: string;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minAmount?: number;
  paymentMethods: string[]; // e.g. ['ALL'], ['HDFC_CREDIT_CARD', 'HDFC_DEBIT_CARD'], ['CRED', 'PAYTM_UPI']
  eligibleUsers?: string; // 'All Users', 'First Time Booking', 'Students'
  restrictions?: string;
  validFrom: string;
  validTo: string;
  source: string;
  verificationStatus: VerificationStatus;
  verifiedAt: string;
  verifiedBy: string;
}

export interface PriceSnapshot {
  id: string;
  offerKey: string;
  providerId: string;
  tripKey: string;
  routeId: string;
  journeyDate: string;
  basePrice: number;
  finalPrice: number;
  seatsAvailable?: number | null;
  capturedAt: string;
  provenance: Provenance;
}

export type RecommendationVerdict = 
  | 'BOOK_NOW' 
  | 'WAIT_AND_MONITOR' 
  | 'HIGH_DEMAND_BOOK_NOW' 
  | 'PRICE_DROP_DETECTED' 
  | 'INSUFFICIENT_DATA';

export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RecommendationEvidence {
  label: string;
  value: string;
  provenance: Provenance;
}

export interface Recommendation {
  verdict: RecommendationVerdict;
  confidence: ConfidenceLevel;
  probabilities?: {
    priceUp: number;
    priceDown: number;
    soldOut: number;
  };
  explanation: string[];
  evidence: RecommendationEvidence[];
  monitorUntil?: string;
  disclaimer: string;
}

export interface SearchQuery {
  fromCity: string;
  toCity: string;
  journeyDate: string; // YYYY-MM-DD
  passengers: number;
  preferences?: {
    acOnly?: boolean;
    sleeperOnly?: boolean;
    operators?: string[];
    departureWindow?: 'ALL' | 'EARLY_MORNING' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    maxPrice?: number;
    minRating?: number;
  };
}

export interface AlertRule {
  id: string;
  userId: string;
  userEmail: string;
  routeId: string;
  fromCity: string;
  toCity: string;
  journeyDate: string;
  tripKey?: string;
  operatorName?: string;
  targetPrice?: number;
  dropPercentThreshold?: number;
  seatsBelowThreshold?: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'PAUSED';
  createdAt: string;
  lastTriggeredAt?: string | null;
  cooldownMinutes: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  isPopular: boolean;
  aliases: string[];
}
