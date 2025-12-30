'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { authService } from '@/lib/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      }
    } catch (error) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <CGVHeader />

      <div className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100">
          
          <div className="bg-red-600 py-4 px-8">
            <h1 className="text-2xl font-black text-white uppercase text-center">
              QUÊN MẬT KHẨU
            </h1>
          </div>

          <div className="p-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                  </p>
                  <label className="block text-gray-800 font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-black text-lg uppercase hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'GỬI YÊU CẦU'}
                </button>

                <div className="text-center">
                  <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800">Thành công!</h2>
                <p className="text-gray-600">
                  Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.
                  Vui lòng kiểm tra hộp thư đến.
                </p>
                <Link 
                  href="/auth/login"
                  className="inline-block mt-6 bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  QUAY LẠI ĐĂNG NHẬP
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <CGVFooter />
    </div>
  );
}
