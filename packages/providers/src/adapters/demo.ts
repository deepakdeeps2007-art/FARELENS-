import { BusProviderAdapter, ProviderCapabilities, ProviderResult } from '../interface';
import { NormalizedBusOffer, ProviderStatus, SearchQuery, Coupon } from '@/core/types/index';
import { computePriceBreakdown } from '@/core/pricing/index';

export class DemoBusAdapter implements BusProviderAdapter {
  id = 'demo-provider';
  name = 'FareLens Demo Engine';
  capabilities: ProviderCapabilities = {
    seatCounts: true,
    ratings: true,
    coupons: true,
    boardingPoints: true,
    priceBreakdown: true,
  };

  status(): ProviderStatus {
    return 'DEMO';
  }

  buildDeepLink(offer: NormalizedBusOffer, affiliateCtx?: Record<string, string>): string {
    // In demo mode, booking links point to provider portal search with clear disclosure
    const providerSlug = offer.providerId.replace('demo-', '');
    return `https://www.${providerSlug}.com/?utm_source=farelens&utm_medium=demo_comparison&ref=${offer.id}`;
  }

  async searchBuses(query: SearchQuery): Promise<ProviderResult<NormalizedBusOffer[]>> {
    const from = (query.fromCity || 'Bangalore').trim();
    const to = (query.toCity || 'Hyderabad').trim();
    const journeyDate = query.journeyDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Seed data generator for realistic Indian bus operators
    const operatorTemplates = [
      {
        operator: 'VRL Travels',
        category: 'SLEEPER' as const,
        isAc: true,
        model: 'Volvo Multi-Axle I-Shift AC Sleeper (2+1)',
        depHour: 21,
        depMin: 15,
        durationHours: 8.5,
        basePrice: 1250,
        rating: 4.6,
        reviews: 2420,
        amenities: ['Blankets', 'Charging Point', 'Reading Light', 'Track My Bus', 'Water Bottle', 'Emergency Exit'],
        boarding: ['Majestic / Kempegowda Bus Station', 'Anand Rao Circle', 'Madiwala', 'Hebbal Flyover'],
        dropping: ['Ameerpet', 'Mehdipatnam', 'Gachibowli', 'Kacheguda'],
        totalSeats: 36,
        bookedSeats: 29, // 7 seats left
      },
      {
        operator: 'Orange Travels',
        category: 'SLEEPER' as const,
        isAc: true,
        model: 'Scania Metrolink Multi-Axle AC Sleeper (2+1)',
        depHour: 22,
        depMin: 0,
        durationHours: 8.25,
        basePrice: 1350,
        rating: 4.5,
        reviews: 1840,
        amenities: ['Blankets', 'Live Tracking', 'Charging Point', 'Pillow', 'Water Bottle', 'Deep Cleaned'],
        boarding: ['Madiwala Police Station', 'Shantinagar Bus Stand', 'Yeshwantpur', 'Hebbal'],
        dropping: ['Afzalgunj', 'Lakdi-ka-pul', 'Panjagutta', 'SR Nagar', 'Kukatpally'],
        totalSeats: 36,
        bookedSeats: 32, // 4 seats left -> HIGH DEMAND
      },
      {
        operator: 'IntrCity SmartBus',
        category: 'SLEEPER' as const,
        isAc: true,
        model: 'SmartBus Club Class AC Sleeper with Restroom',
        depHour: 20,
        depMin: 45,
        durationHours: 8.0,
        basePrice: 1400,
        rating: 4.7,
        reviews: 3120,
        amenities: ['In-Bus Washroom', 'Smart Lounge Access', 'WiFi', 'CCTV', 'Blanket & Pillow', 'Free Snacks'],
        boarding: ['IntrCity SmartLounge Kalasipalyam', 'Indiranagar', 'Tin Factory', 'Kempapura'],
        dropping: ['Shamshabad Airport', 'Aramghar', 'Nampally', 'Secunderabad'],
        totalSeats: 32,
        bookedSeats: 18, // 14 seats left
      },
      {
        operator: 'Zingbus',
        category: 'SEATER' as const,
        isAc: true,
        model: 'BharatBenz Climate Control AC Seater (2+2)',
        depHour: 22,
        depMin: 30,
        durationHours: 8.75,
        basePrice: 850,
        rating: 4.3,
        reviews: 950,
        amenities: ['Live Tracking', 'Charging Point', 'Reading Light', 'Complimentary Water'],
        boarding: ['Electronic City', 'Silk Board', 'Kallada Travels Madiwala', 'Yelahanka'],
        dropping: ['Kurnool Toll', 'Jadcherla', 'Mehdipatnam', 'Jubilee Bus Station'],
        totalSeats: 44,
        bookedSeats: 22,
      },
      {
        operator: 'SRS Travels',
        category: 'SLEEPER' as const,
        isAc: false,
        model: 'Non-AC Sleeper (2+1)',
        depHour: 19,
        depMin: 30,
        durationHours: 9.5,
        basePrice: 750,
        rating: 3.9,
        reviews: 1410,
        amenities: ['Charging Point', 'Reading Light', 'Luggage Compartment'],
        boarding: ['Kalasipalyam', 'Gandhinagar', 'Navrang Circle', 'Jalahalli Cross'],
        dropping: ['Jedimetla', 'Balanagar', 'Moosapet', 'Miyapur'],
        totalSeats: 36,
        bookedSeats: 26,
      },
      {
        operator: 'KPN Travels',
        category: 'SEMI_SLEEPER' as const,
        isAc: true,
        model: 'Volvo B11R Semi-Sleeper AC (2+2)',
        depHour: 23,
        depMin: 15,
        durationHours: 7.75,
        basePrice: 1100,
        rating: 4.4,
        reviews: 1680,
        amenities: ['Water Bottle', 'Charging Point', 'Emergency Hammer', 'CCTV'],
        boarding: ['St. Johns Hospital Signal', 'Domlur', 'Hebbal Flyover'],
        dropping: ['Aramghar', 'Afzalgunj', 'Secunderabad'],
        totalSeats: 40,
        bookedSeats: 28,
      },
    ];

    // Filter by preferences if specified
    let filteredTemplates = operatorTemplates;
    if (query.preferences?.acOnly) {
      filteredTemplates = filteredTemplates.filter((t) => t.isAc);
    }
    if (query.preferences?.sleeperOnly) {
      filteredTemplates = filteredTemplates.filter((t) => t.category === 'SLEEPER');
    }

    const offers: NormalizedBusOffer[] = [];
    const providers = [
      { id: 'demo-redbus', name: 'redBus', platformFee: 20, convenienceFee: 15, discountRatio: 0.05, code: 'REDFIRST' },
      { id: 'demo-abhibus', name: 'AbhiBus', platformFee: 15, convenienceFee: 10, discountRatio: 0.08, code: 'ABHICHEAP' },
      { id: 'demo-makemytrip', name: 'MakeMyTrip', platformFee: 30, convenienceFee: 20, discountRatio: 0.04, code: 'MMTBUS' },
      { id: 'demo-paytm', name: 'Paytm Bus', platformFee: 10, convenienceFee: 15, discountRatio: 0.07, code: 'BUSPAYTM' },
      { id: 'demo-operator-direct', name: 'Operator Direct', platformFee: 0, convenienceFee: 0, discountRatio: 0.0, code: '' },
    ];

    filteredTemplates.forEach((template, index) => {
      const tripId = `trip-${index + 1}`;
      const depDate = new Date(`${journeyDate}T00:00:00.000Z`);
      depDate.setUTCHours(template.depHour, template.depMin, 0, 0);
      
      const arrDate = new Date(depDate.getTime() + template.durationHours * 3600000);

      const boardingPoints = template.boarding.map((name, i) => ({
        id: `bp-${index}-${i}`,
        name,
        location: `${from}, Terminal ${i + 1}`,
        time: new Date(depDate.getTime() + i * 20 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }));

      const droppingPoints = template.dropping.map((name, i) => ({
        id: `dp-${index}-${i}`,
        name,
        location: `${to}, Stop ${i + 1}`,
        time: new Date(arrDate.getTime() + i * 25 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }));

      // Generate offers across 3-4 providers for this physical bus
      providers.forEach((provider, pIdx) => {
        // Operator direct might only offer select buses
        if (provider.id === 'demo-operator-direct' && index % 2 !== 0) return;

        // Slight realistic price variation across providers
        const varianceFactor = 1 + (pIdx - 2) * 0.03; // -6% to +6%
        const adjustedBase = Math.round(template.basePrice * varianceFactor);
        const operatorDiscount = Math.round(adjustedBase * provider.discountRatio);

        const pricing = computePriceBreakdown({
          basePrice: adjustedBase,
          operatorDiscount,
          platformFee: provider.platformFee,
          convenienceFee: provider.convenienceFee,
          taxRatePercent: template.isAc ? 5 : 0,
          couponDiscount: provider.code ? 75 : 0,
          couponCode: provider.code || undefined,
        });

        // Seats left (some providers report slightly different live cache)
        const seatsLeft = Math.max(1, template.totalSeats - template.bookedSeats + (pIdx % 2 === 0 ? 0 : -1));

        offers.push({
          id: `offer-${index + 1}-${provider.id}`,
          tripId,
          providerId: provider.id,
          providerName: provider.name,
          operatorName: template.operator,
          busType: {
            category: template.category,
            isAc: template.isAc,
            model: template.model,
          },
          departsAt: depDate.toISOString(),
          arrivesAt: arrDate.toISOString(),
          durationMinutes: Math.round(template.durationHours * 60),
          pricing,
          seatsAvailable: seatsLeft,
          totalSeats: template.totalSeats,
          rating: template.rating,
          reviewCount: template.reviews,
          amenities: template.amenities,
          boardingPoints,
          droppingPoints,
          deepLink: this.buildDeepLink({
            id: `offer-${index + 1}-${provider.id}`,
            tripId,
            providerId: provider.id,
            providerName: provider.name,
          } as NormalizedBusOffer),
          provenance: 'DEMO',
          fetchedAt: new Date().toISOString(),
          isDirectBooking: provider.id === 'demo-operator-direct',
        });
      });
    });

    return {
      providerId: this.id,
      providerName: this.name,
      status: 'DEMO',
      success: true,
      data: offers,
      lastUpdatedAt: new Date().toISOString(),
      isDemo: true,
    };
  }
}
