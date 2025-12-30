import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, rows, seatsPerRow, seat_type_id } = body;

    if (!room_id || !rows || !seatsPerRow || !seat_type_id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seatsToCreate = [];

    for (let i = 0; i < rows; i++) {
      const rowLetter = rowLetters[i];
      for (let j = 1; j <= seatsPerRow; j++) {
        seatsToCreate.push({
          room_id: parseInt(room_id),
          seat_row: rowLetter,
          seat_number: j,
          seat_type_id: parseInt(seat_type_id),
          status: 'active' as const,
        });
      }
    }

    await prisma.seats.deleteMany({
      where: { room_id: parseInt(room_id) },
    });

    const createdSeats = await prisma.seats.createMany({
      data: seatsToCreate,
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${createdSeats.count} ghế thành công`,
      data: { count: createdSeats.count },
    });
  } catch (error) {
    console.error('Error creating bulk seats:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo ghế hàng loạt' },
      { status: 500 }
    );
  }
}
