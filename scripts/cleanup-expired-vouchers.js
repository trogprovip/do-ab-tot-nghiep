const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupExpiredVouchers() {
  try {
    console.log('🧹 Starting cleanup of expired vouchers...');
    
    // Find expired vouchers
    const expiredVouchers = await prisma.promotionusage.findMany({
      where: {
        promotions: {
          end_date: {
            lt: new Date()
          }
        }
      },
      include: {
        promotions: true,
        accounts: true
      }
    });
    
    console.log(`Found ${expiredVouchers.length} expired vouchers to delete`);
    
    if (expiredVouchers.length > 0) {
      // Delete expired vouchers
      const deleteResult = await prisma.promotionusage.deleteMany({
        where: {
          promotions: {
            end_date: {
              lt: new Date()
            }
          }
        }
      });
      
      console.log(`✅ Successfully deleted ${deleteResult.count} expired vouchers`);
      
      // Log details
      expiredVouchers.forEach(voucher => {
        console.log(`  - Deleted: ${voucher.promotions.promotion_name} for user ${voucher.accounts.username}`);
      });
    } else {
      console.log('✅ No expired vouchers found');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up expired vouchers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
cleanupExpiredVouchers();
