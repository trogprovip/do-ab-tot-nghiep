/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { Carousel, Card } from 'antd';
import { 
  LeftOutlined, 
  RightOutlined, 
  TagFilled, 
  GiftFilled,
  StarFilled,
  FireFilled,
  TeamOutlined 
} from '@ant-design/icons';
import Link from 'next/link';

// Mock data giả lập màu nền cho từng card để sinh động hơn
const events = [
  { id: 1, title: 'Quà Tặng Đầy Tay', image: '/events/gift-1.jpg', icon: <GiftFilled />, color: 'from-pink-500 to-rose-500' },
  { id: 2, title: 'Đồng Giá 79.000Đ', image: '/events/price-79k.jpg', icon: <TagFilled />, color: 'from-orange-400 to-red-500' },
  { id: 3, title: 'Combo Bắp Nước', image: '/events/price-79k-2.jpg', icon: <FireFilled />, color: 'from-yellow-400 to-orange-500' },
  { id: 4, title: 'CGV Member Day', image: '/events/member-day.jpg', icon: <StarFilled />, color: 'from-purple-500 to-indigo-500' },
  { id: 5, title: 'U22 Vui Vẻ', image: '/events/u22.jpg', icon: <TeamOutlined />, color: 'from-blue-400 to-cyan-500' },
];

const specialOffers = [
  {
    id: 1,
    title: 'Quà Tặng Kỷ Niệm',
    sub: 'Dành cho cặp đôi',
    gradient: 'bg-gradient-to-br from-rose-400 to-red-600',
    icon: <GiftFilled className="text-4xl opacity-50" />
  },
  {
    id: 2,
    title: 'Học Sinh - Sinh Viên',
    sub: 'Chỉ từ 60.000đ',
    gradient: 'bg-gradient-to-br from-teal-400 to-emerald-600',
    icon: <TagFilled className="text-4xl opacity-50" />
  },
  {
    id: 3,
    title: 'Thuê Rạp & Vé Nhóm',
    sub: 'Ưu đãi doanh nghiệp',
    gradient: 'bg-gradient-to-br from-amber-400 to-orange-600',
    icon: <TeamOutlined className="text-4xl opacity-50" />
  },
];

export default function EventSection() {
  const carouselRef = React.useRef<any>(null);
  const [activeTab, setActiveTab] = useState('member');

  return (
    <section className="py-16 bg-white relative">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-60 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Title */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-pink-600 uppercase tracking-tighter drop-shadow-sm mb-2">
            KHUYẾN MÃI & ƯU ĐÃI
          </h2>
          <div className="w-20 h-1.5 bg-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Custom Tabs Switcher */}
        <div className="mb-10 flex justify-center">
          <div className="p-1.5 bg-gray-100 rounded-full inline-flex shadow-inner">
            <button 
                onClick={() => setActiveTab('member')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'member' ? 'bg-white text-red-600 shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <GiftFilled /> Thành Viên CGV
            </button>
            <button 
                onClick={() => setActiveTab('news')}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'news' ? 'bg-white text-red-600 shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <TagFilled /> Tin Mới & Ưu Đãi
            </button>
          </div>
        </div>

        {/* Events Carousel */}
        <div className="relative mb-16 px-4 md:px-8">
          {/* Navigation Buttons */}
          <button
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white text-red-600 rounded-full shadow-lg border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all hover:scale-110 -ml-2 md:-ml-6"
          >
            <LeftOutlined className="text-lg" />
          </button>

          <button
            onClick={() => carouselRef.current?.next()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white text-red-600 rounded-full shadow-lg border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all hover:scale-110 -mr-2 md:-mr-6"
          >
            <RightOutlined className="text-lg" />
          </button>

          <Carousel
            ref={carouselRef}
            slidesToShow={4}
            slidesToScroll={1}
            dots={false}
            autoplay
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 480, settings: { slidesToShow: 1 } },
            ]}
          >
            {events.map((event) => (
              <div key={event.id} className="px-3 pb-4 pt-2">
                <Link href={`/events/${event.id}`}>
                    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.15)] transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full">
                    {/* Image Area with Fallback Gradient */}
                    <div className={`relative h-56 w-full bg-gradient-to-tr ${event.color} flex items-center justify-center overflow-hidden`}>
                        {/* Decorative Patterns */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>
                        
                        {/* Content inside Image Area */}
                        <div className="text-center z-10 transform transition-transform duration-500 group-hover:scale-110">
                            <div className="text-5xl text-white mb-2 drop-shadow-md">{event.icon}</div>
                        </div>

                        {/* "Xem Chi Tiết" Overlay */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="bg-white text-red-600 px-6 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                XEM CHI TIẾT
                            </span>
                        </div>
                    </div>

                    {/* Title Area */}
                    <div className="p-4 text-center">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-red-600 transition-colors line-clamp-1">
                        {event.title}
                        </h3>
                    </div>
                    </div>
                </Link>
              </div>
            ))}
          </Carousel>
        </div>

        {/* Special Offers Grid - 3 Cột Màu Sắc */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specialOffers.map((offer) => (
            <Link href={`/offers/${offer.id}`} key={offer.id}>
                <div className={`relative h-48 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group ${offer.gradient}`}>
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-center px-8 z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-black text-white leading-tight max-w-[80%] uppercase drop-shadow-md">
                                {offer.title}
                            </h3>
                            <div className="text-white/80 group-hover:rotate-12 transition-transform duration-300">
                                {offer.icon}
                            </div>
                        </div>
                        
                        <p className="text-white/90 font-medium text-lg mb-4">{offer.sub}</p>
                        
                        <div className="w-fit bg-white/20 backdrop-blur-md border border-white/40 text-white text-sm font-bold px-4 py-2 rounded-lg group-hover:bg-white group-hover:text-gray-800 transition-all">
                            KHÁM PHÁ NGAY
                        </div>
                    </div>
                </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}