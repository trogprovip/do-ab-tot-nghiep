import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params; // ✅ Await params
    const id = parseInt(idParam);

    const room = await prisma.rooms.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        cinemas: {
          select: {
            id: true,
            cinema_name: true,
            provinces: {
              select: {
                province_name: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params; // ✅ Await params
    const id = parseInt(idParam);
    const body = await request.json();

    const existingRoom = await prisma.rooms.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    const updateData: {
      cinema_id?: number;
      room_name?: string;
      room_type?: string | null;
      total_seats?: number;
      status?: 'active' | 'inactive';
    } = {};

    if (body.cinema_id !== undefined) {
      updateData.cinema_id = parseInt(body.cinema_id);
    }
    if (body.room_name !== undefined) {
      updateData.room_name = body.room_name;
    }
    if (body.room_type !== undefined) {
      updateData.room_type = body.room_type || null;
    }
    if (body.total_seats !== undefined) {
      updateData.total_seats = parseInt(body.total_seats);
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    await prisma.rooms.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params; // ✅ Await params
    const id = parseInt(idParam);

    const existingRoom = await prisma.rooms.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    await prisma.rooms.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    );
  }
}