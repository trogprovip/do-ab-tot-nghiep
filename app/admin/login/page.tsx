'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';
import { 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  LockOutlined, 
  UserOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const response = await authService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (response.success) {
        if (response.user?.role === 'admin') {
          // Có thể dùng Toast/Notification thay vì alert để đẹp hơn
          alert('Đăng nhập Admin thành công!');
          window.location.href = '/admin';
        } else {
          alert('Tài khoản này không có quyền Admin!');
          authService.logout();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background Gradient Xanh nước biển dịu mắt
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Các hình tròn trang trí nền (Background Blobs) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Cột bên trái: Hình ảnh/Banner (Ẩn trên mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-600 p-12 flex-col justify-between text-white">
          <div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center mb-6">
               <SafetyCertificateOutlined className="text-2xl" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Hệ Thống Quản Trị</h2>
            <p className="text-blue-100 opacity-90">
              Truy cập an toàn vào bảng điều khiển trung tâm để quản lý rạp chiếu, phim và người dùng.
            </p>
          </div>
          <div className="text-sm text-blue-200">
            © 2024 CGV Management System
          </div>
        </div>

        {/* Cột bên phải: Form Login */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Xin chào Admin! 👋</h1>
            <p className="text-gray-500 text-sm">Vui lòng đăng nhập thông tin xác thực của bạn.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserOutlined className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Mật khẩu</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockOutlined className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider & Back Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors group"
            >
              <UserOutlined className="group-hover:-translate-x-1 transition-transform" /> 
              Quay lại trang User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}