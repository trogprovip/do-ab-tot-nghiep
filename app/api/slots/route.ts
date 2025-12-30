import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const movie_id = searchParams.get('movie_id');
    const room_id = searchParams.get('room_id');

    const skip = page * size;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      is_deleted: false,
    };

    if (movie_id) {
      where.movie_id = parseInt(movie_id);
    }

    if (room_id) {
      where.room_id = parseInt(room_id);
    }

    if (search) {
      where.OR = [
        { movies: { title: { contains: search } } },
        { rooms: { room_name: { contains: search } } },
      ];
    }

    const [slots, total] = await Promise.all([
      prisma.slots.findMany({
        where,
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
        orderBy: { show_time: 'desc' },
        skip,
        take: size,
      }),
      prisma.slots.count({ where }),
    ]);

    return NextResponse.json({
      content: slots,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.movie_id || !body.room_id || !body.show_time || !body.end_time || !body.price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSlot = await prisma.slots.create({
      data: {
        movie_id: parseInt(body.movie_id),
        room_id: parseInt(body.room_id),
        show_time: new Date(body.show_time),
        end_time: new Date(body.end_time),
        price: parseFloat(body.price),
        empty_seats: parseInt(body.empty_seats) || 0,
        create_at: new Date(),
        is_deleted: false,
      },
    });

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
