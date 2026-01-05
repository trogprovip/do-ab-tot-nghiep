import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const cinema_id = searchParams.get('cinema_id');
    const status = searchParams.get('status');

    const skip = page * size;

    const where: {
      is_deleted: boolean;
      cinema_id?: number;
      status?: 'active' | 'inactive';
      OR?: Array<{
        room_name?: { contains: string };
        room_type?: { contains: string };
      }>;
    } = {
      is_deleted: false,
    };

    if (cinema_id) {
      where.cinema_id = parseInt(cinema_id);
    }

    if (status) {
      where.status = status as 'active' | 'inactive';
    }

    if (search) {
      where.OR = [
        { room_name: { contains: search } },
        { room_type: { contains: search } },
      ];
    }

    const [rooms, total] = await Promise.all([
      prisma.rooms.findMany({
        where,
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
        orderBy: { id: 'desc' },
        skip,
        take: size,
      }),
      prisma.rooms.count({ where }),
    ]);

    return NextResponse.json({
      content: rooms,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.cinema_id || !body.room_name || !body.room_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRoom = await prisma.rooms.create({
      data: {
        cinema_id: parseInt(body.cinema_id),
        room_name: body.room_name,
        room_type: body.room_type,
        total_seats: body.total_seats ? parseInt(body.total_seats) : 0,
        status: body.status || 'active',
        is_deleted: false,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
