/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const date = searchParams.get('date');
    const province_id = searchParams.get('province_id');

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

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.show_time = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (province_id) {
      where.rooms = {
        cinemas: {
          province_id: parseInt(province_id),
        },
      };
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
                  id: true,
                  cinema_name: true,
                  address: true,
                  province_id: true,
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

    if (!body.movie_id || !body.room_id || !body.show_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Đếm số ghế thực tế trong phòng (chỉ đếm ghế active)
    const seatCount = await prisma.seats.count({
      where: {
        room_id: parseInt(body.room_id),
        status: 'active', // Chỉ đếm ghế hoạt động, bỏ ghế hỏng
      },
    });

    if (seatCount === 0) {
      return NextResponse.json(
        { error: 'Room has no seats. Please create seats first.' },
        { status: 400 }
      );
    }

    // Lấy giá vé từ setting_system (type = 'ticket_price')
    let ticketPrice = 80000; // Giá mặc định (ngày thường)
    try {
      const priceSetting = await prisma.setting_system.findUnique({
        where: { type: 'ticket_price' },
      });
      if (priceSetting && priceSetting.config_data) {
        const config = priceSetting.config_data as any;
        // Kiểm tra ngày chiếu là ngày thường hay cuối tuần
        const showDate = new Date(body.show_time);
        const dayOfWeek = showDate.getDay(); // 0 = Sunday, 6 = Saturday
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Cuối tuần (Thứ 7, Chủ nhật)
          ticketPrice = config.weekendPrice || 120000;
        } else {
          // Ngày thường (Thứ 2 - Thứ 6)
          ticketPrice = config.weekdayPrice || 80000;
        }
      }
    } catch (err) {
      console.log('Using default ticket price:', ticketPrice);
    }

    const newSlot = await prisma.slots.create({
      data: {
        movie_id: parseInt(body.movie_id),
        room_id: parseInt(body.room_id),
        show_time: new Date(body.show_time),
        end_time: new Date(body.end_time),
        price: ticketPrice,
        empty_seats: seatCount, // Số ghế thực tế đã tạo
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
