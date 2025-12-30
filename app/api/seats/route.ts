import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room_id');

    const where: { room_id?: number } = {};
    if (roomId) {
      where.room_id = parseInt(roomId);
    }

    const seats = await prisma.seats.findMany({
      where,
      include: {
        seattypes: true,
        rooms: {
          include: {
            cinemas: true,
          },
        },
      },
      orderBy: [
        { seat_row: 'asc' },
        { seat_number: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: seats,
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách ghế' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, seat_row, seat_number, seat_type_id, status } = body;

    if (!room_id || !seat_row || !seat_number || !seat_type_id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const existingSeat = await prisma.seats.findFirst({
      where: {
        room_id: parseInt(room_id),
        seat_row,
        seat_number: parseInt(seat_number),
      },
    });

    if (existingSeat) {
      return NextResponse.json(
        { success: false, message: 'Ghế này đã tồn tại trong phòng' },
        { status: 400 }
      );
    }

    const seat = await prisma.seats.create({
      data: {
        room_id: parseInt(room_id),
        seat_row,
        seat_number: parseInt(seat_number),
        seat_type_id: parseInt(seat_type_id),
        status: status || 'active',
      },
      include: {
        seattypes: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo ghế thành công',
      data: seat,
    });
  } catch (error) {
    console.error('Error creating seat:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo ghế' },
      { status: 500 }
    );
  }
}
