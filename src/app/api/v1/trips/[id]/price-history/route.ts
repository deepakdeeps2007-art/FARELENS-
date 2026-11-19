import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tripKey = params.id;
  const { searchParams } = new URL(request.url);
  const basePrice = parseInt(searchParams.get('basePrice') || '1200', 10);

  const repo = FareLensRepository.getInstance();
  const snapshots = repo.getSnapshotsForTrip(tripKey, basePrice);

  return NextResponse.json({
    success: true,
    data: {
      tripKey,
      snapshots,
      count: snapshots.length,
      provenance: 'HISTORICAL',
    },
  });
}
