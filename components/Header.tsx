'use client';

import React, { useState, useEffect } from 'react';
import { Search, Mail, Bell, ChevronDown, Menu, LogOut } from 'lucide-react';
import { authService, User } from '@/lib/services/authService';
import Link from 'next/link';

export default function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      authService.logout();
      setCurrentUser(null);
      setShowDropdown(false);
      setTimeout(() => {
        window.location.replace('/admin/login');
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] px-6 py-4 transition-all duration-300">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Toggle (Hidden on large screens) */}
          <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>

        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4 ml-6">
          
          {/* Messages */}
          <button className="relative p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300 group">
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 border-2 border-white rounded-full scale-0 group-hover:scale-100 transition-transform"></span>
          </button>
          
          {/* Notifications with Pulse Effect */}
          <button className="relative p-2.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-all duration-300 group mr-2">
            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {/* Ping Animation */}
            <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
            </span>
          </button>

          {/* User Profile */}
          <div className="relative">
            <div 
              className="flex items-center gap-3 pl-2 md:pl-6 border-l border-gray-200 cursor-pointer group"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="text-right hidden md:block">
                {currentUser ? (
                  <>
                    <p className="text-xs text-gray-400 font-medium mb-0.5 group-hover:text-red-500 transition-colors">Xin chào,</p>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-500 transition-all">
                      {currentUser.full_name}
                    </p>
                  </>
                ) : (
                  <Link href="/admin/login">
                    <p className="text-sm font-bold text-gray-800 hover:text-red-600 transition-colors">
                      Đăng Nhập
                    </p>
                  </Link>
                )}
              </div>
            
            <div className="relative">
                {/* Avatar Ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full blur opacity-0 group-hover:opacity-70 transition duration-500"></div>
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {/* Placeholder Avatar Gradient or Image */}
                    <div className="w-full h-full bg-gradient-to-tr from-blue-100 via-blue-300 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">TD</span>
                    </div>
                    {/* Online Status Dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
            </div>
            
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:rotate-180 hidden sm:block" />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{currentUser.full_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                    {currentUser.role === 'admin' ? 'ADMIN' : 'USER'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}