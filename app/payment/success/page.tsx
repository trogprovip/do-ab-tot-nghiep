/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin, Card, Button, Alert, Typography, Space, Divider } from 'antd';
import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

const { Title, Text } = Typography;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const transactionNo = searchParams.get('transactionNo');

    if (orderId && amount) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentData({
        orderId,
        amount: parseInt(amount || '0'),
        transactionNo,
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <CGVHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <Text type="secondary">Đang xử lý kết quả thanh toán...</Text>
        </div>
        <CGVFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf0]">
      <CGVHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleFilled className="text-6xl text-green-600" />
          </div>
          
          <Title level={1} className="!mb-4 text-green-600">🎉 Thanh Toán Thành Công!</Title>
          <Text className="text-lg text-gray-600">
            Giao dịch của bạn đã được xử lý thành công qua VNPay
          </Text>
        </div>

        <Card className="shadow-2xl border-none overflow-hidden mb-8">
          <div className="bg-black p-4 text-white">
            <Title level={4} className="text-white m-0 uppercase tracking-widest text-center">
              Chi Tiết Giao Dịch
            </Title>
          </div>
          
          <div className="p-8 space-y-6 bg-white">
            {paymentData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Text type="secondary" className="block text-sm mb-1">Mã Giao Dịch</Text>
                      <div className="bg-red-600 text-white px-4 py-3 rounded-lg font-mono font-bold text-lg tracking-wider">
                        {paymentData.orderId}
                      </div>
                    </div>
                    
                    {paymentData.transactionNo && (
                      <div>
                        <Text type="secondary" className="block text-sm mb-1">Mã Giao Dịch VNPay</Text>
                        <Text strong className="text-lg">{paymentData.transactionNo}</Text>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Text type="secondary" className="block text-sm mb-1">Số Tiền Thanh Toán</Text>
                      <Text className="text-3xl font-black text-red-600">
                        {(paymentData.amount / 100).toLocaleString('vi-VN')}đ
                      </Text>
                    </div>
                    
                    <div>
                      <Text type="secondary" className="block text-sm mb-1">Phương Thức Thanh Toán</Text>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">V</span>
                        </div>
                        <Text strong>VNPay</Text>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Divider />
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <InfoCircleOutlined className="text-blue-600 text-xl mt-1" />
                    <div>
                      <Text strong className="text-blue-800 block mb-2">Thông tin quan trọng:</Text>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Vé đã được xác nhận và lưu vào hệ thống</li>
                        <li>• Bạn có thể sử dụng mã vé để check-in tại rạp</li>
                        <li>• Vui lòng đến rạp trước 15 phút suất chiếu</li>
                        <li>• Email xác nhận đã được gửi đến hòm thư của bạn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button 
            size="large" 
            className="px-8"
            onClick={() => router.push('/')}
          >
            Về Trang Chủ
          </Button>
          <Button 
            type="primary" 
            size="large" 
            className="px-8 bg-red-600 hover:bg-red-700"
            onClick={() => router.push('/cgv/profile?tab=bookings')}
          >
            Xem Vé Của Tôi
          </Button>
        </div>
      </main>

      <CGVFooter />
    </div>
  );
}
