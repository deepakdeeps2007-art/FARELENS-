import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';
import { RecommendationEngine } from '@/core/recommendation/index';
import { Provenance } from '@/core/types/index';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tripKey = params.id;
  const { searchParams } = new URL(request.url);

  const currentFinalPrice = parseInt(searchParams.get('currentPrice') || '1200', 10);
  const seatsAvailableParam = searchParams.get('seats');
  const seatsAvailable = seatsAvailableParam !== null ? parseInt(seatsAvailableParam, 10) : null;
  const totalSeats = parseInt(searchParams.get('totalSeats') || '36', 10);
  const daysToDeparture = parseInt(searchParams.get('daysToDep') || '3', 10);
  const provenance = (searchParams.get('provenance') || 'DEMO') as Provenance;

  const repo = FareLensRepository.getInstance();
  const snapshots = repo.getSnapshotsForTrip(tripKey, currentFinalPrice);

  const recommendation = RecommendationEngine.recommend({
    currentFinalPrice,
    snapshots,
    seatsAvailable,
    totalSeats,
    daysToDeparture,
    provenance,
  });

  return NextResponse.json({
    success: true,
    data: {
      tripKey,
      recommendation,
    },
  });
}
