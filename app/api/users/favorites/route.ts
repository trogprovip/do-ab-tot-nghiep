import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken, getAdminFromToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const userPayload = getUserFromToken(request) || getAdminFromToken(request);
    
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get unique movies that user has booked (as favorite movies)
    const bookedMovies = await prisma.tickets.findMany({
      where: {
        account_id: userPayload.id,
        is_deleted: false,
        status: 'confirmed', // Only count confirmed bookings
      },
      include: {
        slots: {
          include: {
            movies: true,
          },
        },
      },
      orderBy: {
        tickets_date: 'desc',
      },
    });

    // Get unique movies only (remove duplicates)
    const uniqueMovies = bookedMovies.filter((booking, index, self) =>
      index === self.findIndex((b) => b.slots.movie_id === booking.slots.movie_id)
    );

    // Transform data to match frontend interface
    const favoriteMovies = uniqueMovies.map((booking) => ({
      id: booking.slots.movies.id,
      title: booking.slots.movies.title,
      poster_url: booking.slots.movies.poster_url || 'https://via.placeholder.com/300x450',
      genre: booking.slots.movies.genre || 'N/A',
      duration: booking.slots.movies.duration,
      release_date: booking.slots.movies.release_date?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: favoriteMovies,
    });
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorite movies' },
      { status: 500 }
    );
  }
}
