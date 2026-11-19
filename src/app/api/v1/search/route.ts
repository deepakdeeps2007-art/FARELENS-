import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProviderRegistry } from '@/providers/registry';
import { FareLensRepository } from '@/db/repository';

const searchSchema = z.object({
  fromCity: z.string().min(1, 'From city is required'),
  toCity: z.string().min(1, 'To destination is required'),
  journeyDate: z.string().min(1, 'Journey date is required'),
  passengers: z.number().int().min(1).max(6).default(1),
  preferences: z.object({
    acOnly: z.boolean().optional(),
    sleeperOnly: z.boolean().optional(),
    operators: z.array(z.string()).optional(),
    departureWindow: z.enum(['ALL', 'EARLY_MORNING', 'MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']).optional(),
    maxPrice: z.number().optional(),
    minRating: z.number().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = searchSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid search parameters',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const query = parsed.data;
    const registry = ProviderRegistry.getInstance();
    const repo = FareLensRepository.getInstance();

    // Log query in search history
    repo.logSearch(query);

    // Execute parallel provider aggregation
    const results = await registry.searchAll(query);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'An unexpected error occurred during search.',
        },
      },
      { status: 500 }
    );
  }
}
