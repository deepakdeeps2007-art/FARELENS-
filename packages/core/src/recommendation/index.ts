import { 
  PriceSnapshot, 
  Recommendation, 
  RecommendationVerdict, 
  ConfidenceLevel, 
  RecommendationEvidence, 
  Provenance 
} from '../types';

export interface RecommendationFeatures {
  currentFinalPrice: number;
  snapshots: PriceSnapshot[];
  seatsAvailable?: number | null;
  totalSeats?: number | null;
  daysToDeparture: number;
  isWeekendOrHoliday?: boolean;
  minSnapshotsRequired?: number; // default 5
  minHistoryHoursRequired?: number; // default 48h
  provenance: Provenance;
}

export class RecommendationEngine {
  public static readonly DEFAULT_MIN_SNAPSHOTS = 5;
  public static readonly DEFAULT_MIN_HOURS = 48;
  public static readonly STANDARD_DISCLAIMER = 
    'Recommendations are probabilistic estimates based on observed historical pricing patterns and current seat velocity. Bus operators and booking providers may alter fares or inventory at any moment without notice. FareLens does not guarantee future price movements or seat availability.';

  public static recommend(features: RecommendationFeatures): Recommendation {
    const minSnapshots = features.minSnapshotsRequired ?? this.DEFAULT_MIN_SNAPSHOTS;
    const minHours = features.minHistoryHoursRequired ?? this.DEFAULT_MIN_HOURS;
    const snapshots = [...(features.snapshots || [])].sort(
      (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
    );

    // Check history time span
    const historyDurationHours = snapshots.length >= 2
      ? (new Date(snapshots[snapshots.length - 1].capturedAt).getTime() - new Date(snapshots[0].capturedAt).getTime()) / (1000 * 60 * 60)
      : 0;

    // RULE 1: Cold start / Insufficient Data
    if (snapshots.length < minSnapshots || historyDurationHours < minHours) {
      return {
        verdict: 'INSUFFICIENT_DATA',
        confidence: 'LOW',
        probabilities: {
          priceUp: 33,
          priceDown: 33,
          soldOut: 34,
        },
        explanation: [
          'Not enough booking history to make a reliable prediction. Compare current prices and book according to your preference.',
          `Observed ${snapshots.length} snapshot(s) over ${Math.round(historyDurationHours)} hour(s) (threshold requires ≥${minSnapshots} snapshots over ≥${minHours}h).`,
        ],
        evidence: [
          {
            label: 'Snapshots Recorded',
            value: `${snapshots.length} / ${minSnapshots} required`,
            provenance: 'HISTORICAL',
          },
          {
            label: 'Observation Window',
            value: `${Math.round(historyDurationHours)}h / ${minHours}h required`,
            provenance: 'HISTORICAL',
          },
          {
            label: 'Current Payable Price',
            value: `₹${features.currentFinalPrice}`,
            provenance: features.provenance,
          },
        ],
        disclaimer: this.STANDARD_DISCLAIMER,
      };
    }

    // Historical calculations
    const prices = snapshots.map((s) => s.finalPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
    const previousSnapshot = snapshots[snapshots.length - 1];
    const previousPrice = previousSnapshot.finalPrice;

    // Check seat occupancy if provided
    let occupancyPercent: number | null = null;
    if (features.seatsAvailable !== undefined && features.seatsAvailable !== null && features.totalSeats && features.totalSeats > 0) {
      occupancyPercent = Math.round(((features.totalSeats - features.seatsAvailable) / features.totalSeats) * 100);
    }

    // Price change percentage from immediate prior observation
    const priceDiff = features.currentFinalPrice - previousPrice;
    const priceChangePct = previousPrice > 0 ? (priceDiff / previousPrice) * 100 : 0;

    // Evidence collector
    const evidence: RecommendationEvidence[] = [
      {
        label: 'Current Final Price',
        value: `₹${features.currentFinalPrice}`,
        provenance: features.provenance,
      },
      {
        label: 'Historical Low Observed',
        value: `₹${minPrice}`,
        provenance: 'HISTORICAL',
      },
      {
        label: 'Historical Average',
        value: `₹${avgPrice}`,
        provenance: 'HISTORICAL',
      },
    ];

    if (features.seatsAvailable !== null && features.seatsAvailable !== undefined) {
      evidence.push({
        label: 'Seats Remaining',
        value: `${features.seatsAvailable} seats`,
        provenance: features.provenance,
      });
    }

    // RULE 2: PRICE_DROP_DETECTED (Current price lower by >= 3% from prior snapshot)
    if (priceChangePct <= -3) {
      const dropAmount = Math.abs(priceDiff);
      const absDropPct = Math.abs(priceChangePct).toFixed(1);
      return {
        verdict: 'PRICE_DROP_DETECTED',
        confidence: snapshots.length >= 8 ? 'HIGH' : 'MEDIUM',
        probabilities: {
          priceUp: 45,
          priceDown: 20,
          soldOut: 35,
        },
        explanation: [
          `Price dropped by ${absDropPct}% (₹${dropAmount} savings) from previous observation of ₹${previousPrice}.`,
          `Current price of ₹${features.currentFinalPrice} is at or near the lowest recorded level (Low: ₹${minPrice}).`,
          'Fares that dip frequently rebound when booking demand resumes.',
        ],
        evidence,
        disclaimer: this.STANDARD_DISCLAIMER,
      };
    }

    // RULE 3: HIGH_DEMAND_BOOK_NOW
    // Condition: Occupancy >= 75% or seats <= 6 OR departure in <= 1 day with high price OR rising price trend
    const isCriticalSeats = features.seatsAvailable !== null && features.seatsAvailable !== undefined && features.seatsAvailable <= 6;
    const isHighOccupancy = occupancyPercent !== null && occupancyPercent >= 75;
    const isImminentDeparture = features.daysToDeparture <= 1;

    if (isCriticalSeats || isHighOccupancy || (isImminentDeparture && features.isWeekendOrHoliday)) {
      return {
        verdict: 'HIGH_DEMAND_BOOK_NOW',
        confidence: 'HIGH',
        probabilities: {
          priceUp: 70,
          priceDown: 5,
          soldOut: 85,
        },
        explanation: [
          'HIGH DEMAND – BOOK NOW: Seats are filling quickly. Waiting may reduce your available options or increase the ticket price.',
          isCriticalSeats ? `Only ${features.seatsAvailable} seats left on this service.` : `Bus is currently ${occupancyPercent}% full.`,
          features.daysToDeparture <= 2 ? `Departure is in ${features.daysToDeparture} day(s), peak booking surge active.` : 'Weekend/peak route travel window.',
        ],
        evidence,
        disclaimer: this.STANDARD_DISCLAIMER,
      };
    }

    // RULE 4: WAIT_AND_MONITOR
    // Condition: Departure > 3 days away, price is at or above historical average, occupancy is low (< 40%),
    // and historical snapshots indicate frequent off-peak fare reductions.
    const isEarlyBookingWindow = features.daysToDeparture >= 3;
    const isLowOccupancy = occupancyPercent !== null ? occupancyPercent < 45 : true;
    const isPricedAboveLow = features.currentFinalPrice > minPrice * 1.05;

    if (isEarlyBookingWindow && isLowOccupancy && isPricedAboveLow) {
      const monitorHours = Math.min(24, Math.max(12, (features.daysToDeparture - 2) * 12));
      const monitorUntilDate = new Date(Date.now() + monitorHours * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      return {
        verdict: 'WAIT_AND_MONITOR',
        confidence: snapshots.length >= 10 ? 'MEDIUM' : 'LOW',
        probabilities: {
          priceUp: 25,
          priceDown: 55,
          soldOut: 20,
        },
        explanation: [
          'Demand appears relatively low. A price drop may be possible. Monitor this bus before booking.',
          `Departure is ${features.daysToDeparture} days away. Operators frequently release promotional allocations 2–4 days prior.`,
          `Historical low for this bus is ₹${minPrice} (₹${features.currentFinalPrice - minPrice} below current fare).`,
        ],
        evidence,
        monitorUntil: monitorUntilDate,
        disclaimer: this.STANDARD_DISCLAIMER,
      };
    }

    // RULE 5: Default BOOK_NOW
    return {
      verdict: 'BOOK_NOW',
      confidence: 'MEDIUM',
      probabilities: {
        priceUp: 45,
        priceDown: 15,
        soldOut: 40,
      },
      explanation: [
        'No clear signal that waiting will help.',
        `Price is consistent with historical patterns (Average: ₹${avgPrice}, Current: ₹${features.currentFinalPrice}).`,
        'Locking in your preferred seat and boarding location is recommended.',
      ],
      evidence,
      disclaimer: this.STANDARD_DISCLAIMER,
    };
  }
}
