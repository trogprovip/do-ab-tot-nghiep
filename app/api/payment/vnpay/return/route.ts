/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { VNPayService, VNPayReturnData } from '@/lib/vnpay';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function để cập nhật booking status
async function updateBookingPaymentStatus(bookingId: string, status: string, paymentStatus: string) {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    await prisma.tickets.update({
      where: { id: bookingIdNum },
      data: {
        status: status as any, // pending, confirmed, cancelled
        payment_status: paymentStatus as any, // unpaid, paid, refunded
      }
    });

    console.log(`✅ Updated booking ${bookingId} to status: ${status}, payment: ${paymentStatus}`);
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    throw error;
  }
}

// Helper function để cập nhật voucher usage khi thanh toán thành công
async function updateVoucherUsage(bookingId: string) {
  try {
    const bookingIdNum = parseInt(bookingId);
    if (isNaN(bookingIdNum)) {
      throw new Error('Invalid booking ID');
    }

    // Lấy thông tin ticket để tìm promotion_id
    const ticket = await prisma.tickets.findUnique({
      where: { id: bookingIdNum },
      select: { 
        promotion_id: true,
        account_id: true,
        discount_amount: true
      }
    });

    if (!ticket || !ticket.promotion_id) {
      console.log(`📝 No voucher found for booking ${bookingId}`);
      return;
    }

    // Cập nhật promotionusage với ticket_id thực tế
    const updatedUsage = await prisma.promotionusage.updateMany({
      where: {
        account_id: ticket.account_id,
        promotion_id: ticket.promotion_id,
        tickets_id: 1, // Giá trị mặc định khi activate
      },
      data: {
        tickets_id: bookingIdNum, // Cập nhật với ticket_id thực tế
        discount_amount: ticket.discount_amount || 0,
      }
    });

    console.log(`✅ Updated voucher usage for booking ${bookingId}:`, updatedUsage);

    // Tăng số lần sử dụng của promotion
    await prisma.promotions.update({
      where: { id: ticket.promotion_id },
      data: {
        usage_count: {
          increment: 1
        }
      }
    });

    console.log(`✅ Incremented promotion usage count for voucher ${ticket.promotion_id}`);

  } catch (error) {
    console.error('❌ Error updating voucher usage:', error);
    // Không throw error để không ảnh hưởng đến payment flow
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // ✅ Log raw URL để debug
    console.log('📥 Raw URL:', request.url);
    
    const query = Object.fromEntries(searchParams.entries()) as unknown as VNPayReturnData;

    console.log('📥 VNPay Return Query:', query);
    console.log('🔐 Received Hash:', query.vnp_SecureHash);

    // Validate required fields
    if (!query.vnp_TxnRef || !query.vnp_ResponseCode || !query.vnp_SecureHash) {
      console.error('❌ Missing required VNPay response parameters');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/payment/failed?error=missing_params&orderId=${query.vnp_TxnRef || 'unknown'}`
      );
    }

    const vnpayService = new VNPayService();
    
    // Verify the response
    const isValid = vnpayService.verifyReturnUrl(query);
    
    if (!isValid) {
      console.error('❌ Invalid VNPay signature');
      console.error('Query params:', JSON.stringify(query, null, 2));
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/payment/failed?error=invalid_signature&orderId=${query.vnp_TxnRef}`
      );
    }

    console.log('✅ VNPay signature verified');

    // Check payment status
    const isSuccessful = query.vnp_ResponseCode === '00';
    const statusMessage = vnpayService.getPaymentStatus(query.vnp_ResponseCode);

    if (isSuccessful) {
      console.log(`✅ Payment successful for order ${query.vnp_TxnRef}`);
      
      // 1️⃣ Cập nhật booking status thành paid
      const bookingId = query.vnp_TxnRef.replace('BOOKING_', '');
      try {
        await updateBookingPaymentStatus(bookingId, 'confirmed', 'paid');
        console.log(`✅ Updated booking ${bookingId} from pending to confirmed/paid`);
        
        // 2️⃣ Cập nhật voucher usage khi thanh toán thành công
        await updateVoucherUsage(bookingId);
        console.log(`✅ Updated voucher usage for booking ${bookingId}`);
      } catch (error) {
        console.error(`❌ Failed to update booking ${bookingId}:`, error);
      }
      
      // Redirect về trang chủ với thông báo thành công
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/cgv?payment=success&orderId=${query.vnp_TxnRef}`
      );
    } else {
      console.log(`❌ Payment failed for order ${query.vnp_TxnRef}: ${statusMessage}`);
      
      // 2️⃣ Cập nhật booking status thành cancelled với payment_status là unpaid
      const bookingId = query.vnp_TxnRef.replace('BOOKING_', '');
      try {
        await updateBookingPaymentStatus(bookingId, 'cancelled', 'unpaid');
        console.log(`✅ Updated booking ${bookingId} to cancelled/unpaid status`);
      } catch (error) {
        console.error(`❌ Failed to update booking ${bookingId}:`, error);
      }
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/payment/failed?orderId=${query.vnp_TxnRef}&responseCode=${query.vnp_ResponseCode}&message=${encodeURIComponent(statusMessage)}`
      );
    }

  } catch (error) {
    console.error('❌ VNPay return processing error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_URL}/payment/failed?error=server_error`
    );
  }
}