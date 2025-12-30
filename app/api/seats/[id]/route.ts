import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { seat_row, seat_number, seat_type_id, status } = body;

    const seat = await prisma.seats.update({
      where: { id: parseInt(id) },
      data: {
        seat_row,
        seat_number: parseInt(seat_number),
        seat_type_id: parseInt(seat_type_id),
        status,
      },
      include: {
        seattypes: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật ghế thành công',
      data: seat,
    });
  } catch (error) {
    console.error('Error updating seat:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật ghế' },
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

    await prisma.seats.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa ghế thành công',
    });
  } catch (error) {
    console.error('Error deleting seat:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa ghế' },
      { status: 500 }
    );
  }
}
