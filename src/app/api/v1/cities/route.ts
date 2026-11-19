import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  
  const repo = FareLensRepository.getInstance();
  const cities = repo.searchCities(q);

  return NextResponse.json({
    success: true,
    data: cities,
  });
}
