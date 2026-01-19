import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Delete expired voucher usages
    const deletedCount = await prisma.promotionusage.deleteMany({
      where: {
        promotions: {
          end_date: {
            lt: new Date()
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${deletedCount.count} voucher hết hạn`,
      deletedCount: deletedCount.count
    });
  } catch (error) {
    console.error('Error cleaning up expired vouchers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup expired vouchers' },
      { status: 500 }
    );
  }
}

// Manual cleanup endpoint
export async function DELETE(request: NextRequest) {
  return POST(request);
}
