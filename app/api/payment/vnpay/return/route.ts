import { NextRequest, NextResponse } from 'next/server';
import { VNPayService, VNPayReturnData } from '@/lib/vnpay';

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
      
      const displayAmount = parseInt(query.vnp_Amount) / 100;
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_URL}/payment/success?orderId=${query.vnp_TxnRef}&amount=${displayAmount}&transactionNo=${query.vnp_TransactionNo}`
      );
    } else {
      console.log(`❌ Payment failed for order ${query.vnp_TxnRef}: ${statusMessage}`);
      
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