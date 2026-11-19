import { City, Coupon, PriceSnapshot } from '@/core/types/index';

export const POPULAR_CITIES: City[] = [
  { id: 'blr', name: 'Bangalore', state: 'Karnataka', isPopular: true, aliases: ['Bengaluru', 'BLR'] },
  { id: 'hyd', name: 'Hyderabad', state: 'Telangana', isPopular: true, aliases: ['HYD', 'Secunderabad'] },
  { id: 'mum', name: 'Mumbai', state: 'Maharashtra', isPopular: true, aliases: ['Bombay', 'BOM'] },
  { id: 'pun', name: 'Pune', state: 'Maharashtra', isPopular: true, aliases: ['PNQ'] },
  { id: 'del', name: 'Delhi', state: 'Delhi NCR', isPopular: true, aliases: ['New Delhi', 'DEL'] },
  { id: 'jai', name: 'Jaipur', state: 'Rajasthan', isPopular: true, aliases: ['JAI', 'Pink City'] },
  { id: 'chn', name: 'Chennai', state: 'Tamil Nadu', isPopular: true, aliases: ['Madras', 'MAA'] },
  { id: 'goa', name: 'Goa', state: 'Goa', isPopular: true, aliases: ['Panaji', 'Madgaon', 'GOI'] },
  { id: 'ahm', name: 'Ahmedabad', state: 'Gujarat', isPopular: true, aliases: ['AMD'] },
  { id: 'cbe', name: 'Coimbatore', state: 'Tamil Nadu', isPopular: true, aliases: ['CJB'] },
  { id: 'vij', name: 'Vijayawada', state: 'Andhra Pradesh', isPopular: false, aliases: ['BZA'] },
  { id: 'vzg', name: 'Visakhapatnam', state: 'Andhra Pradesh', isPopular: false, aliases: ['Vizag', 'VTZ'] },
  { id: 'kol', name: 'Kolkata', state: 'West Bengal', isPopular: true, aliases: ['Calcutta', 'CCU'] },
  { id: 'chd', name: 'Chandigarh', state: 'Punjab / Haryana', isPopular: true, aliases: ['IXC'] },
  { id: 'koc', name: 'Kochi', state: 'Kerala', isPopular: true, aliases: ['Cochin', 'Ernakulam', 'COK'] },
];

export const POPULAR_ROUTES = [
  { from: 'Bangalore', to: 'Hyderabad', minFare: 699, avgDuration: '8h 30m', busCount: 42 },
  { from: 'Mumbai', to: 'Pune', minFare: 349, avgDuration: '3h 45m', busCount: 88 },
  { from: 'Delhi', to: 'Jaipur', minFare: 499, avgDuration: '5h 15m', busCount: 56 },
  { from: 'Chennai', to: 'Bangalore', minFare: 550, avgDuration: '6h 00m', busCount: 64 },
  { from: 'Hyderabad', to: 'Goa', minFare: 1199, avgDuration: '13h 30m', busCount: 18 },
  { from: 'Pune', to: 'Goa', minFare: 899, avgDuration: '10h 00m', busCount: 32 },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    providerId: 'demo-redbus',
    providerName: 'redBus',
    code: 'FIRSTBUS',
    title: 'New User: Flat ₹150 Off',
    description: 'Get flat ₹150 off on your first bus booking with redBus. Valid on bookings above ₹400.',
    type: 'FIRST_TIME',
    discountType: 'FLAT',
    discountValue: 150,
    minAmount: 400,
    paymentMethods: ['ALL'],
    eligibleUsers: 'First-time bus bookers',
    restrictions: 'Cannot be combined with bank cashbacks',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    source: 'PARTNER_FEED',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-11-18',
    verifiedBy: 'FareLens Automation Bot',
  },
  {
    id: 'coup-2',
    providerId: 'demo-abhibus',
    providerName: 'AbhiBus',
    code: 'ABHIHDFC',
    title: 'HDFC Cards: 15% Off Up to ₹250',
    description: 'Get 15% instant discount on payment via HDFC Credit or Debit Cards.',
    type: 'BANK',
    discountType: 'PERCENT',
    discountValue: 15,
    maxDiscount: 250,
    minAmount: 800,
    paymentMethods: ['HDFC_CREDIT_CARD', 'HDFC_DEBIT_CARD'],
    eligibleUsers: 'All HDFC cardholders',
    restrictions: 'Once per card per month',
    validFrom: '2026-01-01',
    validTo: '2027-06-30',
    source: 'OFFICIAL_BANK_OFFER',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-11-19',
    verifiedBy: 'FareLens Team',
  },
  {
    id: 'coup-3',
    providerId: 'ALL',
    providerName: 'All Providers',
    code: 'CRED2026',
    title: 'CRED UPI Flat ₹100 Cashback',
    description: 'Pay using CRED UPI on checkout to receive instant ₹100 off.',
    type: 'WALLET',
    discountType: 'FLAT',
    discountValue: 100,
    minAmount: 600,
    paymentMethods: ['CRED_UPI'],
    eligibleUsers: 'CRED Members',
    restrictions: 'Minimum fare ₹600',
    validFrom: '2026-01-01',
    validTo: '2027-03-31',
    source: 'CRED_PARTNER_DESK',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-11-15',
    verifiedBy: 'FareLens Team',
  },
  {
    id: 'coup-4',
    providerId: 'demo-makemytrip',
    providerName: 'MakeMyTrip',
    code: 'MMTBUS',
    title: 'Public Promo: Flat 10% Off',
    description: 'Enjoy 10% discount on any intercity AC bus route up to ₹150.',
    type: 'PUBLIC',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscount: 150,
    minAmount: 500,
    paymentMethods: ['ALL'],
    eligibleUsers: 'All travellers',
    restrictions: 'AC buses only',
    validFrom: '2026-01-01',
    validTo: '2027-05-31',
    source: 'AFFILIATE_NETWORK',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-11-17',
    verifiedBy: 'FareLens Automation Bot',
  },
  {
    id: 'coup-5',
    providerId: 'demo-paytm',
    providerName: 'Paytm Bus',
    code: 'PAYTMTRIP',
    title: 'Paytm Wallet ₹120 Cashback',
    description: 'Flat ₹120 cashback into Paytm Wallet on bus tickets over ₹750.',
    type: 'WALLET',
    discountType: 'FLAT',
    discountValue: 120,
    minAmount: 750,
    paymentMethods: ['PAYTM_WALLET', 'PAYTM_POSTPAID'],
    eligibleUsers: 'KYC verified Paytm users',
    restrictions: 'Credited within 24 hours of boarding',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    source: 'PAYTM_AFFILIATE',
    verificationStatus: 'VERIFIED',
    verifiedAt: '2026-11-12',
    verifiedBy: 'admin',
  },
  {
    id: 'coup-6',
    providerId: 'ALL',
    providerName: 'All Providers',
    code: 'FESTIVALSPECIAL',
    title: 'Holiday Saver ₹300 Off',
    description: 'Special seasonal coupon for long weekend travellers.',
    type: 'PUBLIC',
    discountType: 'FLAT',
    discountValue: 300,
    minAmount: 2000,
    paymentMethods: ['ALL'],
    eligibleUsers: 'All travellers',
    validFrom: '2026-10-01',
    validTo: '2026-11-01', // Expired!
    source: 'COMMUNITY_REPORTED',
    verificationStatus: 'EXPIRED',
    verifiedAt: '2026-11-02',
    verifiedBy: 'admin',
  },
  {
    id: 'coup-7',
    providerId: 'demo-redbus',
    providerName: 'redBus',
    code: 'STUDENTRIDE',
    title: 'Student Discount: 12% Off',
    description: 'Special concession for verified college students.',
    type: 'PERSONALISED',
    discountType: 'PERCENT',
    discountValue: 12,
    maxDiscount: 180,
    minAmount: 450,
    paymentMethods: ['ALL'],
    eligibleUsers: 'College students with valid ID',
    validFrom: '2026-01-01',
    validTo: '2027-12-31',
    source: 'STUDENT_PORTAL',
    verificationStatus: 'UNVERIFIED',
    verifiedAt: '2026-10-15',
    verifiedBy: 'Community Submission',
  },
];

/**
 * Generates sample historical price snapshots spanning 72 hours for a given trip.
 */
export function generateSeedSnapshots(tripKey: string, basePrice: number, scenario: 'PRICE_DROP' | 'RISING' | 'STABLE' | 'FEW_SNAPSHOTS'): PriceSnapshot[] {
  const now = Date.now();
  const routeId = 'bangalore-hyderabad';
  const journeyDate = new Date(now + 3 * 86400000).toISOString().split('T')[0];

  if (scenario === 'FEW_SNAPSHOTS') {
    // Only 2 snapshots -> will trigger INSUFFICIENT_DATA
    return [
      {
        id: `snap-${tripKey}-1`,
        offerKey: `off-${tripKey}`,
        providerId: 'demo-redbus',
        tripKey,
        routeId,
        journeyDate,
        basePrice,
        finalPrice: Math.round(basePrice * 1.05 + 35),
        seatsAvailable: 22,
        capturedAt: new Date(now - 12 * 3600000).toISOString(),
        provenance: 'HISTORICAL',
      },
      {
        id: `snap-${tripKey}-2`,
        offerKey: `off-${tripKey}`,
        providerId: 'demo-redbus',
        tripKey,
        routeId,
        journeyDate,
        basePrice,
        finalPrice: Math.round(basePrice * 1.05 + 35),
        seatsAvailable: 19,
        capturedAt: new Date(now - 2 * 3600000).toISOString(),
        provenance: 'HISTORICAL',
      },
    ];
  }

  const hoursAgo = [72, 60, 48, 36, 24, 12, 4, 1];
  return hoursAgo.map((h, idx) => {
    let multiplier = 1.0;
    if (scenario === 'PRICE_DROP') {
      // 1.15 down to 0.92
      multiplier = 1.15 - (idx * 0.035);
    } else if (scenario === 'RISING') {
      // 0.90 up to 1.25
      multiplier = 0.90 + (idx * 0.045);
    } else {
      // STABLE
      multiplier = 1.0 + (Math.sin(idx) * 0.02);
    }

    const currentBase = Math.round(basePrice * multiplier);
    const taxes = Math.round(currentBase * 0.05);
    const finalPrice = currentBase + taxes + 35;
    const seatsRemaining = Math.max(2, 34 - (idx * 3));

    return {
      id: `snap-${tripKey}-${idx}`,
      offerKey: `off-${tripKey}`,
      providerId: 'demo-redbus',
      tripKey,
      routeId,
      journeyDate,
      basePrice: currentBase,
      finalPrice,
      seatsAvailable: seatsRemaining,
      capturedAt: new Date(now - h * 3600000).toISOString(),
      provenance: 'HISTORICAL',
    };
  });
}
