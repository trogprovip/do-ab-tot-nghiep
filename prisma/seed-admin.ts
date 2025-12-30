import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin account...');

  const adminEmail = 'admin@cgv.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.accounts.findFirst({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin account already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.accounts.create({
    data: {
      username: 'admin',
      password_hash: hashedPassword,
      email: adminEmail,
      phone: '0123456789',
      full_name: 'Administrator',
      role: 'admin',
      create_at: new Date(),
      is_deleted: false,
    },
  });

  console.log('✅ Admin account created successfully!');
  console.log('📧 Email: admin@cgv.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
