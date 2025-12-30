import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email là bắt buộc' },
        { status: 400 }
      );
    }

    const user = await prisma.accounts.findFirst({
      where: {
        email,
        is_deleted: false,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: true, message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}
