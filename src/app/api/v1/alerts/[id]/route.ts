import { NextRequest, NextResponse } from 'next/server';
import { FareLensRepository } from '@/db/repository';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const alertId = params.id;
  const repo = FareLensRepository.getInstance();
  const deleted = repo.deleteAlert(alertId);

  if (!deleted) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Alert rule not found or already deleted',
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Alert cancelled successfully',
  });
}
