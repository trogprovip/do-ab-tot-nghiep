import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const slot = await prisma.slots.findFirst({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        movies: {
          select: {
            id: true,
            title: true,
          },
        },
        rooms: {
          select: {
            id: true,
            room_name: true,
            cinemas: {
              select: {
                cinema_name: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(slot);
  } catch (error) {
    console.error('Error fetching slot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slot' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    const existingSlot = await prisma.slots.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (body.movie_id !== undefined) {
      updateData.movie_id = parseInt(body.movie_id);
    }
    if (body.room_id !== undefined) {
      updateData.room_id = parseInt(body.room_id);
    }
    if (body.show_time !== undefined) {
      updateData.show_time = new Date(body.show_time);
    }
    if (body.end_time !== undefined) {
      updateData.end_time = new Date(body.end_time);
    }
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
    }
    if (body.empty_seats !== undefined) {
      updateData.empty_seats = parseInt(body.empty_seats);
    }

    await prisma.slots.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating slot:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const existingSlot = await prisma.slots.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existingSlot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    await prisma.slots.update({
      where: { id },
      data: { is_deleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}
