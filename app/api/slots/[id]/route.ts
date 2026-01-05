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
            poster_url: true,
            duration: true,
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
    
    console.log('🔍 Update Request body:', body);
    console.log('🔍 Update movieId:', body.movieId);
    console.log('🔍 Update roomId:', body.roomId);
    console.log('🔍 Update showTime:', body.showTime);
    console.log('🔍 Update endTime:', body.endTime);

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

    // Convert format để đồng bộ với Spring Boot: yyyy-MM-dd HH:mm:ss
    const formatDateTimeForDB = (dateString: string) => {
      console.log('🔍 Input date string:', dateString);
      
      // Parse string thành các phần và tạo Date object với local timezone
      const parts = dateString.split(' ');
      const [year, month, day] = parts[0].split('-');
      const [hours, minutes, seconds] = parts[1].split(':');
      
      // Tạo Date object với local timezone (Vietnam)
      const result = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || '0')
      );
      
      console.log('🔍 Formatted for DB:', result);
      return result;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (body.movieId !== undefined) {
      updateData.movie_id = parseInt(body.movieId);
    }
    if (body.roomId !== undefined) {
      updateData.room_id = parseInt(body.roomId);
    }
    if (body.showTime !== undefined) {
      updateData.show_time = formatDateTimeForDB(body.showTime);
    }
    if (body.endTime !== undefined) {
      updateData.end_time = formatDateTimeForDB(body.endTime);
    }

    console.log('🔍 Update data:', updateData);

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
