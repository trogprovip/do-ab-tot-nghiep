'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserOutlined, ShoppingCartOutlined, MenuOutlined, SearchOutlined,
  GlobalOutlined, VideoCameraOutlined, PlayCircleOutlined, StarOutlined,
  ShopOutlined, PhoneOutlined, GiftOutlined, IdcardOutlined, DownOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { authService, User } from '@/lib/services/authService'; // ✅ authService cho User/CGV

export default function CGVHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser(); // ✅ Dùng authService cho User
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      authService.logout(); // ✅ Dùng authService cho User
      setCurrentUser(null);
      window.location.href = '/'; // ✅ Redirect về trang chủ CGV
    }
  };

  const quickLinks = [
    { href: '/cgv/cinemas', icon: <VideoCameraOutlined />, title: 'CGV CINEMAS', sub: 'RẠP CGV' },
    { href: '/cgv/movies?status=now_showing', icon: <PlayCircleOutlined />, title: 'NOW SHOWING', sub: 'PHIM ĐANG CHIẾU' },
    { href: '/cgv', icon: <StarOutlined />, title: 'CGV SPECIAL', sub: 'RẠP ĐẶC BIỆT' },
    { href: '/cgv', icon: <ShopOutlined />, title: 'GROUP SALES', sub: 'THUÊ RẠP & VÉ NHÓM' },
    { href: '/cgv', icon: <PhoneOutlined />, title: 'CONTACT CGV', sub: 'LIÊN HỆ CGV' },
    { href: '/news', icon: <GiftOutlined />, title: 'NEWS & OFFERS', sub: 'TIN MỚI & ƯU ĐÃI' },
    { href: '/auth/login', icon: <IdcardOutlined />, title: 'REGISTER', sub: 'ĐĂNG KÝ NGAY' },
  ];

  return (
    <header className="font-sans relative z-50">
      
      {/* ================= 1. TOP BAR (Sẽ bị cuộn đi) ================= */}
      <div className="bg-gradient-to-r from-[#990000] via-[#b30000] to-[#cc0000] text-white text-xs md:text-sm py-2 border-b border-yellow-500/40 shadow-lg">
        <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center">
          <div className="flex gap-2 sm:gap-4 font-medium">
            <Link href="/news" className="hover:text-[#ffd700] transition-colors flex items-center gap-1 group">
              <GiftOutlined className="group-hover:animate-wiggle text-sm sm:text-base"/> <span className="hidden sm:inline">TIN MỚI & ƯU ĐÃI</span><span className="sm:hidden">TIN MỚI</span>
            </Link>
            <span className="text-yellow-500/50 hidden sm:inline">|</span>
            <Link href="/cgv/profile?tab=bookings" className="hover:text-[#ffd700] transition-colors">
              <span className="hidden sm:inline">VÉ CỦA TÔI</span><span className="sm:hidden">VÉ CỦA TÔI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 font-medium">
            {currentUser ? (
              <>
                <Link href="/cgv/profile" className="text-[#ffd700] flex items-center gap-1 hover:text-white transition-colors">
                  <UserOutlined className="text-sm sm:text-base"/> <span className="hidden sm:inline">Xin chào, <strong>{currentUser.full_name}</strong></span><span className="sm:hidden"><strong>{currentUser.full_name?.split(' ')[0] || 'User'}</strong></span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-[#ffd700] flex items-center gap-1 transition-colors"
                >
                  <LogoutOutlined className="text-sm sm:text-base"/> <span className="hidden sm:inline">ĐĂNG XUẤT</span><span className="sm:hidden">OUT</span>
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="hover:text-[#ffd700] flex items-center gap-1 transition-colors">
                <UserOutlined className="text-sm sm:text-base"/> <span className="hidden sm:inline">ĐĂNG NHẬP / ĐĂNG KÝ</span><span className="sm:hidden">LOGIN</span>
              </Link>
            )}
            
            <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-0.5 border border-yellow-500/30">
              <GlobalOutlined className="text-xs text-yellow-500" />
              <button className="px-1.5 font-bold text-[#ffd700]">VN</button>
              <span className="text-yellow-500/50">|</span>
              <button className="px-1.5 opacity-70 hover:opacity-100 hover:text-[#ffd700] transition-colors">EN</button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. MAIN NAVIGATION (SẼ DÍNH LẠI - STICKY) ================= */}
      <div className={`bg-gradient-to-r from-[#fffefb] via-[#fffdf9] to-[#fffefb] backdrop-blur-md border-b-2 border-[#d4af37] z-50 transition-all duration-300 
                      sticky top-0 ${scrolled ? 'shadow-2xl shadow-red-900/30 py-2' : 'py-3 md:py-4'}`}>
        <div className="container mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
          <div className="flex justify-between items-center">
                         
            {/* LOGO */}
            <Link href="/" className="group flex items-center gap-1">
               <span className="text-[#d90000] font-black text-4xl tracking-tighter hover:scale-105 transition-transform cursor-pointer drop-shadow-sm">CGV</span>
               <StarOutlined className="text-[#ffd700] text-xl animate-pulse drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
            </Link>

            {/* DESKTOP MENU */}
            <nav className="hidden lg:flex items-center gap-8 font-extrabold text-[#4a4a4a] tracking-wide">
              {/* PHIM Menu with Dropdown */}
              <div className="group relative cursor-pointer py-2">
                <span className="group-hover:text-[#d90000] transition-colors duration-300 flex items-center gap-1">
                  PHIM <DownOutlined className="text-[10px] text-yellow-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#d90000] transition-all duration-300 group-hover:w-full rounded-full shadow-[0_2px_10px_rgba(217,0,0,0.3)]"></span>
                
                {/* Dropdown Menu */}
                <div className="absolute top-[calc(100%-5px)] left-0 pt-4 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top group-hover:translate-y-0 translate-y-2">
                  {/* Mũi tên trỏ lên (Triangle Indicator) */}
                  <div className="absolute top-2 left-6 w-4 h-4 bg-white rotate-45 border-t border-l border-black/5 shadow-[-3px_-3px_5px_rgba(0,0,0,0.02)]"></div>
                  
                  <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.12)] border border-black/5 overflow-hidden">
                    <div className="p-2">
                      {/* Phim Đang Chiếu */}
                      <Link href="/cgv/movies?status=now_showing" className="flex items-center gap-4 px-4 py-4 hover:bg-red-50/80 rounded-2xl transition-all duration-300 group/item hover:translate-x-1">
                        <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center text-red-600 group-hover/item:bg-red-600 group-hover/item:text-white transition-all duration-300 shadow-sm">
                          <PlayCircleOutlined className="text-xl" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-[13px] uppercase tracking-tight">Phim Đang Chiếu</span>
                          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Now Showing</span>
                        </div>
                      </Link>

                      {/* Dấu gạch ngang phân cách nhẹ */}
                      <div className="mx-4 my-1 h-[1px] bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

                      {/* Phim Sắp Chiếu */}
                      <Link href="/cgv/movies?status=coming_soon" className="flex items-center gap-4 px-4 py-4 hover:bg-red-50/80 rounded-2xl transition-all duration-300 group/item hover:translate-x-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-100/50 flex items-center justify-center text-amber-600 group-hover/item:bg-amber-500 group-hover/item:text-white transition-all duration-300 shadow-sm">
                          <StarOutlined className="text-xl" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-gray-800 text-[13px] uppercase tracking-tight">Phim Sắp Chiếu</span>
                          <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Coming Soon</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* RẠP CGV Menu */}
              <Link href="/cgv/cinemas" className="group relative cursor-pointer py-2">
                <span className="group-hover:text-[#d90000] transition-colors duration-300 flex items-center gap-1">
                  RẠP CGV
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#d90000] transition-all duration-300 group-hover:w-full rounded-full shadow-[0_2px_10px_rgba(217,0,0,0.3)]"></span>
              </Link>

              {/* Other Menu Items */}
              {['THÀNH VIÊN', 'CULTUREPLEX'].map((item, idx) => (
                <div key={idx} className="group relative cursor-pointer py-2">
                  <span className="group-hover:text-[#d90000] transition-colors duration-300 flex items-center gap-1">
                    {item} <DownOutlined className="text-[10px] text-yellow-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#d90000] transition-all duration-300 group-hover:w-full rounded-full shadow-[0_2px_10px_rgba(217,0,0,0.3)]"></span>
                </div>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-red-50 hover:text-[#d90000] transition-all border border-transparent hover:border-red-200">
                <SearchOutlined className="text-xl" />
              </button>

              <Link href="/cgv/movies">
                <button className="bg-linear-to-r from-[#d90000] to-[#ff3333] text-white px-6 py-2.5 rounded-full font-bold shadow-[0_4px_15px_rgba(217,0,0,0.4)] border-b-2 border-[#8f0000] hover:shadow-[0_6px_20px_rgba(217,0,0,0.6)] hover:to-[#ff6666] hover:-translate-y-0.5 active:translate-y-0 active:border-b-0 transition-all duration-300 flex items-center gap-2 group relative overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent translate-y-full group-hover:-translate-y-full transition-transform duration-700"></div>
                  <ShoppingCartOutlined className="text-lg animate-bounce-slow text-[#ffd700]" />
                  <span className="hidden md:inline tracking-wider">MUA VÉ</span>
                </button>
              </Link>
              
              <button className="lg:hidden text-2xl text-[#d90000] hover:scale-110 transition-transform">
                <MenuOutlined />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. QUICK LINKS BAR (Sẽ bị cuộn đi) ================= */}
      <div className="relative bg-gradient-to-b from-[#fff8f0] via-[#fff5e6] to-[#fef3e0] py-6 border-t-[3px] border-[#990000] border-b-[3px] border-[#d4af37] overflow-hidden shadow-lg">
        {/* Pattern trang trí */}
        <div className="absolute top-0 left-0 w-full h-3 bg-red-900/10 bg-repeat-x"></div>
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8f0000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>

        <div className="container mx-auto px-2 sm:px-4 relative z-10">
            <div className="flex justify-start md:justify-center items-stretch gap-2 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto py-2 no-scrollbar snap-x">
              {quickLinks.map((link, index) => (
                <Link href={link.href} key={index} className="group flex flex-col items-center justify-center min-w-[85px] sm:min-w-[95px] md:min-w-[110px] lg:min-w-[125px] snap-center cursor-pointer p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-white/60 hover:shadow-lg hover:shadow-[#d90000]/10 flex-shrink-0">
                  <div className="relative mb-2 sm:mb-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full border-[2px] sm:border-[2.5px] border-dashed border-[#8f0000]/40 bg-white/80 text-2xl sm:text-3xl text-[#c4a000] group-hover:border-[#d90000] group-hover:bg-gradient-to-br group-hover:from-[#d90000] group-hover:to-[#ff3333] group-hover:text-white group-hover:border-solid group-hover:shadow-[0_0_25px_rgba(217,0,0,0.7)] group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 ease-out z-10 relative overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ffd700]/50 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700"></div>
                       <span className="relative z-10 group-hover:animate-wiggle drop-shadow-sm text-sm sm:text-base lg:text-xl">{link.icon}</span>
                    </div>
                    <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-8 sm:w-10 lg:w-12 h-1.5 sm:h-2 bg-[#d90000]/30 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="text-center transition-transform duration-300 group-hover:translate-y-[-5px]">
                    <h3 className="text-[10px] xs:text-xs sm:text-xs md:text-sm font-black text-[#2b2b2b] uppercase tracking-tight group-hover:text-[#d90000] transition-colors line-clamp-1">{link.title}</h3>
                    <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-[#8f0000]/70 font-bold mt-0.5 sm:mt-1 group-hover:text-[#d90000] transition-colors line-clamp-1">{link.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .group:hover .group-hover\\:animate-wiggle { animation: wiggle 0.5s ease-in-out; }
      `}} />
    </header>
  );
}