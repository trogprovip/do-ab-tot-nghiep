/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    console.log('🔍 API Request URL:', request.url);
    console.log('🔍 API Search params:', Object.fromEntries(searchParams.entries()));
    
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '10');
    const search = searchParams.get('search') || '';
    const movie_id = searchParams.get('movie_id');
    const room_id = searchParams.get('room_id');
    const date = searchParams.get('date');
    const province_id = searchParams.get('province_id');
    
    console.log('🔍 API Parsed params:', { page, size, search, movie_id, room_id, date, province_id });

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

    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

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

    console.log('🔍 Query result:', { slotsCount: slots.length, total });

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
    console.log('🔍 Request body:', body);
    console.log('🔍 movieId:', body.movieId);
    console.log('🔍 roomId:', body.roomId);
    console.log('🔍 showTime:', body.showTime);
    console.log('🔍 endTime:', body.endTime);

    if (!body.movieId || !body.roomId || !body.showTime || !body.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Đếm số ghế thực tế trong phòng (chỉ đếm ghế active)
    const seatCount = await prisma.seats.count({
      where: {
        room_id: parseInt(body.roomId), // ✅ Dùng roomId từ frontend
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
        // Parse showTime string: "2026-01-07 19:00:00"
        const parts = body.showTime.split(' ');
        const [year, month, day] = parts[0].split('-');
        const showDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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

    // Convert format để đồng bộ với Spring Boot: yyyy-MM-dd HH:mm:ss
    // Input: "2026-01-07 19:00:00" (đã là local time string)
    const formatDateTimeForDB = (dateString: string) => {
      console.log('🔍 Input date string:', dateString);
      
      // ✅ FIX: Không dùng new Date() vì nó sẽ parse theo UTC
      // Chỉ parse string thành các phần và tạo Date object với local timezone
      const parts = dateString.split(' ');
      const [year, month, day] = parts[0].split('-');
      const [hours, minutes, seconds] = parts[1].split(':');
      
      // Tạo Date object với local timezone (Vietnam)
      const result = new Date(
        parseInt(year),
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds || '0')
      );
      
      console.log('🔍 Formatted for DB:', result);
      console.log('🔍 DB ISO:', result.toISOString());
      console.log('🔍 DB Local:', result.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
      
      return result;
    };

    const newSlot = await prisma.slots.create({
      data: {
        movie_id: parseInt(body.movieId), // ✅ Nhận movieId từ frontend
        room_id: parseInt(body.roomId),   // ✅ Nhận roomId từ frontend
        show_time: formatDateTimeForDB(body.showTime), // ✅ Nhận showTime từ frontend
        end_time: formatDateTimeForDB(body.endTime),   // ✅ Nhận endTime từ frontend
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
