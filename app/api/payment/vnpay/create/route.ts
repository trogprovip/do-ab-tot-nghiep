import { NextRequest, NextResponse } from 'next/server';
import { VNPayService, VNPayPaymentData } from '@/lib/vnpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, orderInfo, bankCode, ipAddr } = body;

    // Validate required fields
    if (!amount || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get client IP address if not provided
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let clientIp = ipAddr || forwardedFor || realIp || '127.0.0.1';
    
    // Thay ::1 bằng 127.0.0.1 để tránh lỗi signature
    if (clientIp === '::1') {
      clientIp = '127.0.0.1';
    }

    const paymentData: VNPayPaymentData = {
      amount,
      orderId,
      orderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
      bankCode,
      ipAddr: clientIp // ✅ BỎ COMMENT - nên truyền IP
    };

    const vnpayService = new VNPayService();
    const paymentUrl = vnpayService.createPaymentUrl(paymentData);

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
      amount
    });

  } catch (error) {
    console.error('VNPay create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment URL' },
      { status: 500 }
    );
  }
}