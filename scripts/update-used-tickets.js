#!/usr/bin/env node

// Script để tự động cập nhật vé đã sử dụng
// Chạy script này mỗi 5-10 phút hoặc setup cron job

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUsedTickets() {
  try {
    console.log('🔄 Bắt đầu cập nhật vé đã sử dụng...');
    
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
      console.log('✅ Không có vé nào cần cập nhật');
      return;
    }

    console.log(`📋 Tìm thấy ${ticketsToUpdate.length} vé cần cập nhật thành 'used'`);

    // Cập nhật tất cả vé đã tìm thấy thành 'used'
    const updatePromises = ticketsToUpdate.map((ticket) =>
      prisma.tickets.update({
        where: { id: ticket.id },
        data: { 
          status: 'used',
          note: `Tự động cập nhật: Đã sử dụng - Suất chiếu ${ticket.slots.movies.title} lúc ${ticket.slots.show_time.toLocaleString('vi-VN')}`
        },
      })
    );

    await Promise.all(updatePromises);

    console.log(`✅ Đã cập nhật ${ticketsToUpdate.length} vé sang trạng thái 'used'`);
    
    // Log chi tiết các vé đã cập nhật
    ticketsToUpdate.forEach(ticket => {
      console.log(`  - Vé ${ticket.tickets_code}: ${ticket.slots.movies.title} (${ticket.slots.show_time.toLocaleString('vi-VN')})`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật vé đã sử dụng:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy ngay lập tức
updateUsedTickets();

// Export để có thể import vào file khác
// module.exports = { updateUsedTickets };
