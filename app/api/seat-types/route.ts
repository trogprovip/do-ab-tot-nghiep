import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const seatTypes = await prisma.seattypes.findMany({
      where: { is_deleted: false },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: seatTypes,
    });
  } catch (error) {
    console.error('Error fetching seat types:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách loại ghế' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type_name, price_multiplier, description } = body;

    if (!type_name) {
      return NextResponse.json(
        { success: false, message: 'Tên loại ghế không được để trống' },
        { status: 400 }
      );
    }

    const seatType = await prisma.seattypes.create({
      data: {
        type_name,
        price_multiplier: price_multiplier || 1.0,
        description: description || null,
        is_deleted: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo loại ghế thành công',
      data: seatType,
    });
  } catch (error) {
    console.error('Error creating seat type:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo loại ghế' },
      { status: 500 }
    );
  }
}
