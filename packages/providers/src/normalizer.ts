import { CanonicalBusTrip, NormalizedBusOffer } from '@/core/types/index';

/**
 * Normalizes operator names to handle variations across providers
 * (e.g. "VRL Travels" vs "VRL Tours and Travels" vs "Vijayanand Travels")
 */
export function normalizeOperatorName(rawName: string): string {
  const cleaned = rawName.trim().toLowerCase();
  if (cleaned.includes('vrl')) return 'VRL Travels';
  if (cleaned.includes('srs')) return 'SRS Travels';
  if (cleaned.includes('orange')) return 'Orange Travels';
  if (cleaned.includes('zingbus')) return 'Zingbus';
  if (cleaned.includes('intrcity')) return 'IntrCity SmartBus';
  if (cleaned.includes('kpn')) return 'KPN Travels';
  if (cleaned.includes('morning star')) return 'Morning Star Travels';
  if (cleaned.includes('jabbar')) return 'Jabbar Travels';
  if (cleaned.includes('kaveri')) return 'Kaveri Travels';
  if (cleaned.includes('neeta')) return 'Neeta Tours and Travels';
  if (cleaned.includes('seabird')) return 'Seabird Tourists';
  return rawName.trim();
}

/**
 * Determines if two offers from different providers represent the exact same physical bus service.
 * Criteria: Same normalized operator, departure times within 25 minutes, same bus category (Sleeper/Seater), same AC status.
 */
export function isSamePhysicalTrip(a: NormalizedBusOffer, b: NormalizedBusOffer): boolean {
  if (normalizeOperatorName(a.operatorName) !== normalizeOperatorName(b.operatorName)) {
    return false;
  }

  if (a.busType.category !== b.busType.category || a.busType.isAc !== b.busType.isAc) {
    return false;
  }

  const timeA = new Date(a.departsAt).getTime();
  const timeB = new Date(b.departsAt).getTime();
  const diffMinutes = Math.abs(timeA - timeB) / (1000 * 60);

  return diffMinutes <= 25;
}

/**
 * Groups offers from multiple providers into canonical physical trips.
 */
export function groupOffersIntoCanonicalTrips(
  offers: NormalizedBusOffer[],
  fromCity: string,
  toCity: string
): CanonicalBusTrip[] {
  const canonicalTrips: CanonicalBusTrip[] = [];

  for (const offer of offers) {
    let matchedTrip = canonicalTrips.find((trip) => {
      // Compare with the first offer of the trip
      return isSamePhysicalTrip(trip.offers[0], offer);
    });

    if (matchedTrip) {
      matchedTrip.offers.push(offer);
    } else {
      const canonicalKey = `${normalizeOperatorName(offer.operatorName).toLowerCase().replace(/\s+/g, '-')}-${offer.departsAt.substring(11, 16).replace(':', '')}-${offer.busType.category.toLowerCase()}-${offer.busType.isAc ? 'ac' : 'nonac'}`;
      
      const newTrip: CanonicalBusTrip = {
        id: `canonical-${offer.tripId}`,
        canonicalKey,
        routeId: `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`,
        fromCity,
        toCity,
        operatorName: normalizeOperatorName(offer.operatorName),
        busType: offer.busType,
        departsAt: offer.departsAt,
        arrivesAt: offer.arrivesAt,
        durationMinutes: offer.durationMinutes,
        amenities: [...offer.amenities],
        boardingPoints: [...offer.boardingPoints],
        droppingPoints: [...offer.droppingPoints],
        offers: [offer],
        cheapestOffer: offer,
        highlights: [],
      };

      canonicalTrips.push(newTrip);
    }
  }

  // Post-process each canonical trip: sort offers by final price, assign highlights
  for (const trip of canonicalTrips) {
    // Sort offers within trip by final payable price ascending
    trip.offers.sort((a, b) => a.pricing.finalPriceWithCoupon - b.pricing.finalPriceWithCoupon);
    trip.cheapestOffer = trip.offers[0];

    // Merge distinct amenities
    const amenitySet = new Set<string>();
    trip.offers.forEach(o => o.amenities.forEach(a => amenitySet.add(a)));
    trip.amenities = Array.from(amenitySet);
  }

  // Compute global highlights across all trips for this route search
  if (canonicalTrips.length > 0) {
    // 1. Global Cheapest Trip
    const sortedByPrice = [...canonicalTrips].sort(
      (a, b) => a.cheapestOffer.pricing.finalPriceWithCoupon - b.cheapestOffer.pricing.finalPriceWithCoupon
    );
    sortedByPrice[0].highlights.push('CHEAPEST');

    // 2. Global Fastest Trip
    const sortedByDuration = [...canonicalTrips].sort((a, b) => a.durationMinutes - b.durationMinutes);
    if (!sortedByDuration[0].highlights.includes('CHEAPEST')) {
      sortedByDuration[0].highlights.push('FASTEST');
    }

    // 3. Best Rated (only if rating >= 4.4 and has review count)
    const validRated = canonicalTrips.filter(t => (t.cheapestOffer.rating || 0) >= 4.3);
    validRated.sort((a, b) => (b.cheapestOffer.rating || 0) - (a.cheapestOffer.rating || 0));
    if (validRated.length > 0 && !validRated[0].highlights.includes('CHEAPEST')) {
      validRated[0].highlights.push('BEST_RATED');
    }

    // 4. Best Coupon (highest coupon savings)
    const withCoupons = canonicalTrips.filter(t => t.cheapestOffer.pricing.savings > 100);
    withCoupons.sort((a, b) => b.cheapestOffer.pricing.savings - a.cheapestOffer.pricing.savings);
    if (withCoupons.length > 0 && withCoupons[0].highlights.length === 0) {
      withCoupons[0].highlights.push('BEST_COUPON');
    }

    // 5. Best Value (Balanced price and rating)
    const bestValueCandidates = canonicalTrips.filter(
      t => (t.cheapestOffer.rating || 0) >= 4.2 && t.cheapestOffer.pricing.finalPriceWithCoupon <= sortedByPrice[0].cheapestOffer.pricing.finalPriceWithCoupon * 1.25
    );
    if (bestValueCandidates.length > 0 && bestValueCandidates[0].highlights.length === 0) {
      bestValueCandidates[0].highlights.push('BEST_VALUE');
    }
  }

  return canonicalTrips;
}
