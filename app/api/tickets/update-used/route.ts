/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const now = new Date();
    
    // Tìm tất cả vé đã được xác nhận và đã qua thời gian chiếu
    const ticketsToUpdate = await prisma.tickets.findMany({
      where: {
        status: 'confirmed',
        payment_status: 'paid',
        is_deleted: false,
        slots: {
          show_time: {
            lt: now, // show_time < now (đã qua thời gian chiếu)
          },
        },
      },
      include: {
        slots: {
          select: {
            show_time: true,
            movies: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (ticketsToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Không có vé nào cần cập nhật',
        updatedCount: 0,
      });
    }

    // Cập nhật tất cả vé đã tìm thấy thành 'used'
    const updatePromises = ticketsToUpdate.map((ticket) =>
      prisma.tickets.update({
        where: { id: ticket.id },
        data: { 
          status: 'used' as any,
          note: `Tự động cập nhật: Đã sử dụng - Suất chiếu ${ticket.slots.movies.title} lúc ${ticket.slots.show_time.toLocaleString('vi-VN')}`
        },
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Updated ${ticketsToUpdate.length} tickets to 'used' status`);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${ticketsToUpdate.length} vé sang trạng thái đã sử dụng`,
      updatedCount: ticketsToUpdate.length,
      updatedTickets: ticketsToUpdate.map(t => ({
        id: t.id,
        tickets_code: t.tickets_code,
        movie_title: t.slots.movies.title,
        show_time: t.slots.show_time,
      })),
    });

  } catch (error) {
    console.error('❌ Error updating used tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi cập nhật trạng thái vé' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint để kiểm tra vé cần cập nhật (không thực sự update)
export async function GET() {
  try {
    const now = new Date();
    
    // Tìm các vé sẽ được cập nhật (chỉ để kiểm tra)
    const ticketsToCheck = await prisma.tickets.findMany({
      where: {
        status: 'confirmed',
        payment_status: 'paid',
        is_deleted: false,
        slots: {
          show_time: {
            lt: now,
          },
        },
      },
      include: {
        slots: {
          select: {
            show_time: true,
            movies: {
              select: {
                title: true,
              },
            },
          },
        },
        accounts: {
          select: {
            email: true,
            full_name: true,
          },
        },
      },
      take: 10, // Giới hạn 10 vé để xem
    });

    return NextResponse.json({
      success: true,
      message: `Tìm thấy ${ticketsToCheck.length} vé cần cập nhật (hiển thị 10 vé đầu tiên)`,
      checkCount: ticketsToCheck.length,
      tickets: ticketsToCheck.map(t => ({
        id: t.id,
        tickets_code: t.tickets_code,
        customer: t.accounts.full_name,
        email: t.accounts.email,
        movie_title: t.slots.movies.title,
        show_time: t.slots.show_time,
        time_over: Math.floor((now.getTime() - t.slots.show_time.getTime()) / (1000 * 60 * 60)) + ' giờ',
      })),
    });

  } catch (error) {
    console.error('❌ Error checking used tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Có lỗi xảy ra khi kiểm tra trạng thái vé' 
      },
      { status: 500 }
    );
  }
}
