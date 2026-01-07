import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cinemaId = parseInt(id);
    
    if (isNaN(cinemaId)) {
      return NextResponse.json(
        { error: 'Invalid cinema ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    console.log('Received date parameter:', date);

    // Parse date string as local date (KHÔNG dùng new Date(date) vì nó parse theo UTC)
    const [year, month, day] = date.split('-').map(Number);
    
    // Tạo start date: 00:00:00 local time
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    // Tạo end date: 23:59:59 local time  
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    console.log('Date range:', {
      input: date,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startLocal: startDate.toString(),
      endLocal: endDate.toString()
    });

    const rooms = await prisma.rooms.findMany({
      where: {
        cinema_id: cinemaId,
        is_deleted: false,
      },
      select: {
        id: true,
      },
    });

    console.log(`Found ${rooms.length} rooms for cinema ${cinemaId}`);

    if (rooms.length === 0) {
      return NextResponse.json([]);
    }

    const roomIds = rooms.map(room => room.id);

    const slots = await prisma.slots.findMany({
      where: {
        room_id: { in: roomIds },
        show_time: {
          gte: startDate,
          lte: endDate,
        },
        is_deleted: false,
      },
      include: {
        movies: {
          select: {
            id: true,
            title: true,
            poster_url: true,
            duration: true,
            genre: true,
          },
        },
        rooms: {
          select: {
            room_name: true,
          },
        },
      },
      orderBy: {
        show_time: 'asc',
      },
    });

    console.log(`Found ${slots.length} slots for date ${date}`);
    if (slots.length > 0) {
      console.log('First slot show_time:', slots[0].show_time);
      console.log('Last slot show_time:', slots[slots.length - 1].show_time);
    }

    const moviesMap = new Map();

    slots.forEach((slot) => {
      const movieId = slot.movies.id;
      
      if (!moviesMap.has(movieId)) {
        moviesMap.set(movieId, {
          movie: slot.movies,
          slots: [],
        });
      }

      moviesMap.get(movieId).slots.push({
        id: slot.id,
        start_time: slot.show_time,
        price: slot.price,
        rooms: slot.rooms,
      });
    });

    const result = Array.from(moviesMap.values());
    console.log(`Returning ${result.length} movies with slots`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching movies and slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies and slots' },
      { status: 500 }
    );
  }
}