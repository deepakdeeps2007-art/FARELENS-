import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FareLensRepository } from '@/db/repository';

const createAlertSchema = z.object({
  userId: z.string().default('user-demo-1'),
  userEmail: z.string().email('Valid email is required'),
  routeId: z.string(),
  fromCity: z.string(),
  toCity: z.string(),
  journeyDate: z.string(),
  tripKey: z.string().optional(),
  operatorName: z.string().optional(),
  targetPrice: z.number().optional(),
  dropPercentThreshold: z.number().optional(),
  seatsBelowThreshold: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'user-demo-1';

  const repo = FareLensRepository.getInstance();
  const alerts = repo.getAlerts(userId);

  return NextResponse.json({
    success: true,
    data: alerts,
  });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createAlertSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid alert configuration',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const repo = FareLensRepository.getInstance();
    const alert = repo.createAlert({
      ...parsed.data,
      cooldownMinutes: 180,
    });

    return NextResponse.json(
      {
        success: true,
        data: alert,
        message: `Alert successfully activated! We will notify ${alert.userEmail} when price drops occur.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
