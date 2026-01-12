/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from 'crypto-js';
import moment from 'moment';

export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
}

export interface VNPayPaymentData {
  amount: number;
  orderId: string;
  orderInfo?: string;
  orderType?: string;
  locale?: string;
  bankCode?: string;
  ipAddr?: string;
}

export interface VNPayReturnData {
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_PayDate: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_SecureHash: string;
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_CardType: string;
}

export class VNPayService {
  private config: VNPayConfig;

  constructor() {
    this.config = {
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'Z2UR9FP9',
      vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '3YJ2DWLKOQAAGGMURL8KBYKRU62P5WX3',
      vnp_Url: process.env.NODE_ENV === 'production'
        ? 'https://vnpayment.vn/paymentv2/vpcpay.html'
        : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      vnp_ReturnUrl: `https://ryland-votable-accusatorially.ngrok-free.dev/api/payment/vnpay/return`
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        sorted[key] = value;
      }
    }
    
    return sorted;
  }

  createPaymentUrl(paymentData: VNPayPaymentData): string {
    // ✅ Sử dụng dữ liệu từ paymentData thay vì hardcode
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    // ✅ Xây dựng danh sách tham số (sắp xếp theo Alphabet A-Z)
    let vnp_Params: any = {
      'vnp_Version': '2.1.0',
      'vnp_Command': 'pay',
      'vnp_TmnCode': this.config.vnp_TmnCode,
      'vnp_Locale': paymentData.locale || 'vn',
      'vnp_CurrCode': 'VND',
      'vnp_TxnRef': paymentData.orderId, // ✅ Dùng orderId từ paymentData
      'vnp_OrderInfo': paymentData.orderInfo || `Thanh toan don hang: ${paymentData.orderId}`, // ✅ Dùng orderInfo
      'vnp_OrderType': paymentData.orderType || 'other',
      'vnp_Amount': paymentData.amount * 100, // ✅ Dùng amount từ paymentData
      'vnp_ReturnUrl': this.config.vnp_ReturnUrl,
      'vnp_IpAddr': paymentData.ipAddr || '127.0.0.1', // ✅ Dùng ipAddr từ paymentData
      'vnp_CreateDate': createDate,
    };

    // ✅ Thêm bankCode nếu có
    if (paymentData.bankCode) {
      vnp_Params['vnp_BankCode'] = paymentData.bankCode;
    }

    // Sắp xếp tham số
    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((obj: any, key: any) => {
        obj[key] = vnp_Params[key];
        return obj;
      }, {});

    // Tạo chuỗi ký (Sign Data)
    const signData = new URLSearchParams(vnp_Params).toString();
    
    console.log('🔐 Sign Data:', signData);
    console.log('💰 Amount:', paymentData.amount);
    console.log('📦 Order ID:', paymentData.orderId);
    
    // Tạo mã Hash HMAC-SHA512
    const hmac = CryptoJS.HmacSHA512(signData, this.config.vnp_HashSecret);
    const vnp_SecureHash = hmac.toString(CryptoJS.enc.Hex);

    console.log('✍️ Generated Hash:', vnp_SecureHash);
    console.log('📏 Hash Length:', vnp_SecureHash.length);

    // Tạo URL cuối cùng
    const paymentUrl = this.config.vnp_Url + '?' + signData + '&vnp_SecureHash=' + vnp_SecureHash;
    
    console.log('🌐 Payment URL:', paymentUrl);

    return paymentUrl;
  }

  verifyReturnUrl(query: any): boolean {
    try {
      const vnp_SecureHash = query.vnp_SecureHash;
      
      if (!vnp_SecureHash) {
        console.error('❌ Missing vnp_SecureHash');
        return false;
      }

      // Copy và xóa các trường hash
      const queryCopy = { ...query };
      delete queryCopy.vnp_SecureHash;
      delete queryCopy.vnp_SecureHashType;

      // Sort parameters
      const sortedParams = this.sortObject(queryCopy);

      // Tạo chuỗi verify giống như khi tạo payment URL
      const signData = new URLSearchParams(sortedParams).toString();

      console.log('🔐 Verify Sign Data:', signData);

      // Tạo hash để so sánh (dùng CryptoJS giống createPaymentUrl)
      const hmac = CryptoJS.HmacSHA512(signData, this.config.vnp_HashSecret);
      const signed = hmac.toString(CryptoJS.enc.Hex);

      console.log('✍️ Calculated Hash:', signed);
      console.log('📨 Received Hash:', vnp_SecureHash);

      // So sánh
      const isValid = vnp_SecureHash === signed;
      console.log(isValid ? '✅ Signature valid' : '❌ Signature invalid');

      return isValid;
    } catch (error) {
      console.error('❌ Verify error:', error);
      return false;
    }
  }

  isPaymentSuccessful(query: VNPayReturnData): boolean {
    return this.verifyReturnUrl(query) && query.vnp_ResponseCode === '00';
  }

  getPaymentStatus(responseCode: string): string {
    const statusMap: { [key: string]: string } = {
      '00': 'Giao dịch thành công',
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi',
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'Giao dịch bị từ chối',
      '10': 'Giao dịch đã hủy',
      '11': 'Thất bại do không xác thực được thông tin khách hàng',
      '12': 'Thất bại do không xác thực được thông tin merchant',
      '13': 'Giao dịch đã hết hạn',
      '24': 'Khách hàng hủy giao dịch',
      '51': 'Tài khoản không đủ số dư',
      '65': 'Tài khoản bị giới hạn số lần giao dịch'
    };

    return statusMap[responseCode] || 'Mã phản hồi không hợp lệ';
  }
}