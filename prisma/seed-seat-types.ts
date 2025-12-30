import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding seat types...');

  const seatTypes = [
    {
      type_name: 'Standard',
      price_multiplier: 1.0,
      description: 'Ghế tiêu chuẩn, phù hợp cho mọi khách hàng',
    },
    {
      type_name: 'VIP',
      price_multiplier: 1.5,
      description: 'Ghế VIP cao cấp với không gian rộng rãi và thoải mái hơn',
    },
    {
      type_name: 'Couple',
      price_multiplier: 1.8,
      description: 'Ghế đôi dành cho cặp đôi, không có tay vịn giữa',
    },
    {
      type_name: 'Sweetbox',
      price_multiplier: 2.0,
      description: 'Ghế hộp riêng tư cao cấp nhất với sofa êm ái',
    },
  ];

  for (const seatType of seatTypes) {
    const existing = await prisma.seattypes.findFirst({
      where: { type_name: seatType.type_name },
    });

    if (!existing) {
      await prisma.seattypes.create({
        data: {
          ...seatType,
          is_deleted: false,
        },
      });
      console.log(`✅ Created seat type: ${seatType.type_name}`);
    } else {
      console.log(`⏭️  Seat type already exists: ${seatType.type_name}`);
    }
  }

  console.log('✅ Seat types seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding seat types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
