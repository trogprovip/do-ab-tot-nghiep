import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, rows, seats_per_row, seat_type_id } = body;

    if (!room_id || !rows || !seats_per_row || !seat_type_id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Lấy thông tin seat_type để cập nhật room_type
    const seatType = await prisma.seattypes.findUnique({
      where: { id: parseInt(seat_type_id) },
      select: { type_name: true },
    });

    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const seatsToCreate = [];

    for (let i = 0; i < rows; i++) {
      const rowLetter = rowLetters[i];
      for (let j = 1; j <= seats_per_row; j++) {
        seatsToCreate.push({
          room_id: parseInt(room_id),
          seat_row: rowLetter,
          seat_number: j,
          seat_type_id: parseInt(seat_type_id),
          status: 'active' as const,
        });
      }
    }

    // Kiểm tra xem ghế đã tồn tại chưa
    const existingSeats = await prisma.seats.findMany({
      where: { room_id: parseInt(room_id) },
      select: { seat_row: true, seat_number: true }
    });

    const existingSeatKeys = new Set(
      existingSeats.map(seat => `${seat.seat_row}-${seat.seat_number}`)
    );

    // Chỉ tạo những ghế chưa tồn tại
    const newSeatsToCreate = seatsToCreate.filter(seat => 
      !existingSeatKeys.has(`${seat.seat_row}-${seat.seat_number}`)
    );

    let createdCount = 0;
    if (newSeatsToCreate.length > 0) {
      const createdSeats = await prisma.seats.createMany({
        data: newSeatsToCreate,
      });
      createdCount = createdSeats.count;
    }

    // Đếm tổng số ghế sau khi thêm
    const totalSeatsAfter = await prisma.seats.count({
      where: { room_id: parseInt(room_id) }
    });

    // Tự động cập nhật thông tin phòng
    await prisma.rooms.update({
      where: { id: parseInt(room_id) },
      data: { 
        total_seats: totalSeatsAfter,
        room_type: seatType?.type_name || 'Standard', // Lấy từ loại ghế mới nhất
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã thêm ${createdCount} ghế mới và cập nhật thông tin phòng thành công`,
      data: { count: createdCount, total_seats: totalSeatsAfter, room_type: seatType?.type_name },
    });
  } catch (error) {
    console.error('Error creating bulk seats:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo ghế hàng loạt' },
      { status: 500 }
    );
  }
}
