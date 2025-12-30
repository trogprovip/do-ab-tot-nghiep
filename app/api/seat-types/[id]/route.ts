import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const seatType = await prisma.seattypes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!seatType || seatType.is_deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy loại ghế' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seatType,
    });
  } catch (error) {
    console.error('Error fetching seat type:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải loại ghế' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type_name, price_multiplier, description } = body;

    const seatType = await prisma.seattypes.update({
      where: { id: parseInt(id) },
      data: {
        type_name,
        price_multiplier,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật loại ghế thành công',
      data: seatType,
    });
  } catch (error) {
    console.error('Error updating seat type:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật loại ghế' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.seattypes.update({
      where: { id: parseInt(id) },
      data: { is_deleted: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa loại ghế thành công',
    });
  } catch (error) {
    console.error('Error deleting seat type:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa loại ghế' },
      { status: 500 }
    );
  }
}
