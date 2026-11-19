import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';
import { z } from 'zod';

const createCouponSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  code: z.string().min(2),
  title: z.string().min(3),
  description: z.string(),
  type: z.enum(['PUBLIC', 'BANK', 'WALLET', 'FIRST_TIME', 'PLATFORM', 'PERSONALISED']),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.number().positive(),
  maxDiscount: z.number().optional(),
  minAmount: z.number().optional(),
  paymentMethods: z.array(z.string()).default(['ALL']),
  eligibleUsers: z.string().optional(),
  validFrom: z.string(),
  validTo: z.string(),
  source: z.string(),
  verificationStatus: z.enum(['VERIFIED', 'UNVERIFIED', 'EXPIRED']).default('UNVERIFIED'),
  verifiedAt: z.string(),
  verifiedBy: z.string(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId') || undefined;
  const type = searchParams.get('type') || undefined;
  const onlyVerified = searchParams.get('onlyVerified') === 'true';

  const repo = FareLensRepository.getInstance();
  const coupons = repo.getCoupons({ providerId, type, onlyVerified });

  return NextResponse.json({
    success: true,
    data: coupons,
  });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createCouponSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid coupon data',
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const repo = FareLensRepository.getInstance();
    const created = repo.addCoupon(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: created,
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

export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json();
    const { id, status, verifiedBy } = json;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Coupon ID and status are required',
          },
        },
        { status: 400 }
      );
    }

    const repo = FareLensRepository.getInstance();
    const updated = repo.updateCouponStatus(id, status, verifiedBy || 'admin');

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Coupon not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
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
