import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';

export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  try {
    const offerId = params.offerId;
    const json = await request.json().catch(() => ({}));

    const providerId = json.providerId || 'redbus';
    const tripId = json.tripId || 'unknown';
    const finalPrice = json.finalPrice || 0;

    const repo = FareLensRepository.getInstance();
    const log = repo.logOutboundClick({
      offerId,
      providerId,
      tripId,
      finalPrice,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || undefined,
    });

    // Clean destination URL
    const providerSlug = providerId.replace('demo-', '');
    const targetUrl = `https://www.${providerSlug}.com/?utm_source=farelens&utm_medium=bus_comparison&ref=${offerId}`;

    return NextResponse.json({
      success: true,
      data: {
        clickId: log.id,
        targetUrl,
        affiliateDisclosure: 'You will be redirected to the official booking provider. FareLens may earn an affiliate commission.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRACKING_ERROR',
          message: error.message,
        },
      },
      { status: 500 }
    );
  }
}
