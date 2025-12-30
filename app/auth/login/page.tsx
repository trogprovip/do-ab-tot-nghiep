'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { authService } from '@/lib/services/authService';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Đã bỏ state và hàm liên quan đến Captcha

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    // Đã bỏ captchaInput
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    username: '',
    // Đã bỏ captchaInput
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Đã bỏ bước kiểm tra Captcha

    setLoading(true);
    try {
      const response = await authService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (response.success) {
        if (response.user?.role === 'admin') {
          alert('Tài khoản Admin vui lòng đăng nhập tại trang Admin!');
          authService.logout();
          return;
        }
        alert('Đăng nhập thành công!');
        router.push('/');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Đã bỏ bước kiểm tra Captcha

    setLoading(true);
    try {
      const response = await authService.register({
        full_name: registerForm.full_name,
        phone: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password,
        username: registerForm.username,
      });

      if (response.success) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        setActiveTab('login');
        setRegisterForm({
          full_name: '',
          phone: '',
          email: '',
          password: '',
          username: '',
        });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <CGVHeader />

      <div className="container mx-auto px-4 py-12 mt-20">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100">
          
          {/* Tabs */}
          <div className="flex bg-red-600">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-lg font-black uppercase transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 text-lg font-black uppercase transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-red-600'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              ĐĂNG KÝ
            </button>
          </div>

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="p-8 space-y-6">
              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Email hoặc số điện thoại
                </label>
                <input
                  type="text"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="Email hoặc số điện thoại"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Mật khẩu"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              {/* Phần Captcha đã được xóa ở đây */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-black text-lg uppercase hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
              </button>

              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-blue-600 hover:underline font-medium">
                  Bạn muốn tìm lại mật khẩu?
                </Link>
              </div>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="p-8 space-y-5">
              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  placeholder="Tên"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Tên đăng nhập <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  placeholder="Tên đăng nhập"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Số điện thoại <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-800 font-bold mb-2">
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Mật khẩu"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              {/* Phần Captcha đã được xóa ở đây */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-black text-lg uppercase hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
              </button>
            </form>
          )}
        </div>
      </div>  

      <CGVFooter />
    </div>
  );
}