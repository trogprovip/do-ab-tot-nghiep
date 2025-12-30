'use client';

import React from 'react';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined, FireFilled, StarFilled } from '@ant-design/icons';

const banners = [
  {
    id: 1,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/g/h/ghibli.jpg',
    title: 'CGV MEMBER DAY',
    description: 'Mua 2 Tặng 1 - X2 ĐIỂM THƯỞNG',
    tag: 'ƯU ĐÃI HOT'
  },
  {
    id: 2,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/9/8/980x448_23__4.jpg',
    title: 'SIÊU PHẨM HOẠT HÌNH',
    description: 'Đồng giá 79.000đ Cho Học Sinh - Sinh Viên',
    tag: 'SẮP CHIẾU'
  },
  {
    id: 3,
    image: 'https://iguov8nhvyobj.vcdn.cloud/media/banner/cache/1/b58515f018eb873dafa430b6f9ae0c1e/r/o/rollingbanner_980x448_2_-min.png',
    title: 'COMBO TIẾT KIỆM',
    description: 'Thưởng thức phim hay - Nhận ngay quà chất',
    tag: 'ĐỘC QUYỀN'
  },
];

export default function HeroBanner() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const carouselRef = React.useRef<any>(null);

  return (
    <div className="relative bg-[#fdfcf0] pb-8 pt-4 overflow-hidden">
      
      {/* Pattern nền mờ ảo phía sau */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#d90000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Khung chứa Carousel với hiệu ứng đổ bóng Neon */}
        <div className="relative group rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(220,38,38,0.5)] border-4 border-white ring-4 ring-red-100">
          
          {/* Nút Previous - Cách điệu Glassmorphism */}
          <button
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center
                       bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full 
                       hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.8)]
                       transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-[-20px] group-hover:translate-x-0"
          >
            <LeftOutlined className="text-xl" />
          </button>

          {/* Carousel */}
          <Carousel
            ref={carouselRef}
            autoplay
            autoplaySpeed={5000}
            effect="fade"
            dots={{ className: 'custom-dots-cgv' }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="relative w-full h-[350px] md:h-[500px] overflow-hidden">
                
                {/* 1. IMAGE LAYER with Ken Burns Effect (Zoom chậm) */}
                <div className="absolute inset-0 w-full h-full animate-ken-burns">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 2. GRADIENT OVERLAY (Màu mè & Cinematic) */}
                {/* Gradient từ dưới lên: Đen đậm -> Đỏ tối -> Trong suốt */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 via-transparent to-transparent mix-blend-multiply"></div>

                {/* 3. CONTENT LAYER */}
                <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 md:px-20 mt-8">
                  
                  {/* Tag nhỏ phía trên */}
                  <span className="inline-flex items-center gap-1 bg-yellow-400 text-red-900 px-3 py-1 rounded-full text-xs md:text-sm font-black uppercase tracking-wider mb-4 animate-fade-in-up shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                    <FireFilled className="animate-pulse"/> {banner.tag}
                  </span>

                  {/* Title với hiệu ứng chữ Gradient */}
                  <h2 className="text-4xl md:text-6xl font-black mb-3 uppercase font-sans tracking-tight animate-fade-in-up delay-100">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                      {banner.title}
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-lg md:text-2xl text-gray-200 mb-8 font-medium max-w-2xl mx-auto animate-fade-in-up delay-200 drop-shadow-md">
                    {banner.description}
                  </p>
                  
                  {/* Button - Hiệu ứng trượt sáng (Shine) */}
                  <div className="animate-fade-in-up delay-300">
                    <button className="relative overflow-hidden group/btn bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-3.5 rounded-full font-bold text-lg shadow-[0_10px_20px_rgba(185,28,28,0.4)] hover:shadow-[0_15px_30px_rgba(185,28,28,0.6)] hover:-translate-y-1 transition-all duration-300 border-b-4 border-red-900 active:border-b-0 active:translate-y-0">
                      <span className="relative z-10 flex items-center gap-2">
                        XEM CHI TIẾT <StarFilled className="text-yellow-300 animate-spin-slow"/>
                      </span>
                      {/* Vệt sáng quét qua nút */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-shine"></div>
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </Carousel>

          {/* Nút Next */}
          <button
            onClick={() => carouselRef.current?.next()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center
                       bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full 
                       hover:bg-red-600 hover:border-red-600 hover:scale-110 hover:shadow-[0_0_15px_rgba(220,38,38,0.8)]
                       transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-[20px] group-hover:translate-x-0"
          >
            <RightOutlined className="text-xl" />
          </button>
        </div>
      </div>

      {/* ================= CSS ANIMATIONS ================= */}
      <style jsx global>{`
        /* 1. Hiệu ứng Ken Burns (Zoom ảnh nền) */
        @keyframes ken-burns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        .animate-ken-burns {
          animation: ken-burns 10s ease-out infinite alternate;
        }

        /* 2. Hiệu ứng trượt lên (Fade In Up) cho chữ */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          opacity: 0; /* Mặc định ẩn để chờ animation */
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        /* 3. Hiệu ứng quét sáng (Shine) cho nút */
        @keyframes shine {
          100% { left: 125%; }
        }
        .group-hover\\/btn\\:animate-shine {
          animation: shine 0.75s;
          left: -75%;
          top: 0;
          width: 50%;
          height: 100%;
          transform: skewX(-25deg);
        }

        /* 4. Custom Dots Ant Design */
        .custom-dots-cgv li {
          width: 12px !important;
          height: 12px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.4) !important;
          margin: 0 6px !important;
          transition: all 0.3s !important;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .custom-dots-cgv li.slick-active {
          width: 30px !important;
          border-radius: 10px !important;
          background: #d90000 !important;
          box-shadow: 0 0 10px #d90000;
        }
        .custom-dots-cgv {
          bottom: 25px !important;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}