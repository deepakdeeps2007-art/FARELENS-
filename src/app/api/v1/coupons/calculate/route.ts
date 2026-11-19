import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CouponEngine } from '@/core/coupons/index';
import { FareLensRepository } from '@/db/repository';
import { NormalizedBusOffer } from '@/core/types/index';

const calculateSchema = z.object({
  offer: z.any(), // NormalizedBusOffer
  paymentMethod: z.string().optional().default('ALL'),
  isFirstTimeUser: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = calculateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid calculation input',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { offer, paymentMethod, isFirstTimeUser } = parsed.data;
    const repo = FareLensRepository.getInstance();
    const coupons = repo.getCoupons();

    const calculation = CouponEngine.calculateBestCoupon(
      coupons,
      offer as NormalizedBusOffer,
      {
        paymentMethod,
        isFirstTimeUser,
      }
    );

    return NextResponse.json({
      success: true,
      data: calculation,
    });
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
