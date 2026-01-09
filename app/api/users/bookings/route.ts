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

    // Fetch booking history with movie and cinema details
    const bookings = await prisma.tickets.findMany({
      where: {
        account_id: userPayload.id,
        is_deleted: false,
      },
      include: {
        slots: {
          include: {
            movies: true,
            rooms: {
              include: {
                cinemas: true,
              },
            },
          },
        },
        bookingseats: {
          include: {
            seats: true,
          },
        },
      },
      orderBy: {
        tickets_date: 'desc',
      },
    });

    // Transform data to match frontend interface
    const bookingHistory = bookings.map((booking) => {
      const seats = booking.bookingseats
        .map((bs) => `${bs.seats.seat_row}${bs.seats.seat_number}`)
        .join(', ');

      return {
        id: booking.id,
        movie_title: booking.slots.movies.title,
        cinema_name: booking.slots.rooms?.cinemas?.cinema_name || 'Unknown Cinema',
        showtime: booking.slots.show_time.toISOString(),
        seats: seats,
        total_price: Number(booking.final_amount),
        status: booking.status === 'confirmed' ? 'COMPLETED' : 
                booking.status === 'cancelled' ? 'CANCELLED' : 'UPCOMING',
        booking_date: booking.tickets_date?.toISOString() || booking.slots.show_time.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: bookingHistory,
    });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking history' },
      { status: 500 }
    );
  }
}
