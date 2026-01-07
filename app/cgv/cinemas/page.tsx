'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { EnvironmentOutlined,  PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

interface Cinema {
  id: number;
  cinema_name: string;
  address: string;
  phone?: string;
  provinces: {
    province_name: string;
  };
}

interface Province {
  id: number;
  province_name: string;
}

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showProvinces, setShowProvinces] = useState(true);

  useEffect(() => {
    fetchProvinces();
    fetchCinemas();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch('/api/provinces?size=100');
      const data = await response.json();
      setProvinces(data.content || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cinemas?size=100');
      const data = await response.json();
      setCinemas(data.content || []);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setShowProvinces(false);
  };

  const handleBackToProvinces = () => {
    setSelectedProvince(null);
    setShowProvinces(true);
  };

  // Filter cinemas by selected province
  const filteredCinemas = selectedProvince 
    ? cinemas.filter(cinema => cinema.provinces.province_name === selectedProvince)
    : [];

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Page Header */}
        <div className="bg-[#fdfcf0] py-12 border-b-2 border-red-500/10">
          <div className="container mx-auto px-4 flex flex-col items-center text-center">
            <EnvironmentOutlined className="text-3xl text-red-600 mb-3" />
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-800">
              RẠP <span className="text-red-600">CGV</span>
            </h1>
            <div className="w-12 h-0.5 bg-gray-300 my-4"></div>
            <p className="text-gray-600 text-base md:text-lg font-medium max-w-lg italic">
              Hệ thống rạp chiếu phim hiện đại trên toàn quốc
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : showProvinces ? (
            /* Province Selection - Like hình 2 */
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Chọn Thành Phố</h2>
                <p className="text-gray-600">Vui lòng chọn thành phố để xem các rạp chiếu phim</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {provinces.map((province) => {
            const cinemaCount = cinemas.filter(c => c.provinces.province_name === province.province_name).length;
    
          return (
      <button
        key={province.id}
        onClick={() => handleProvinceSelect(province.province_name)}
        className="group relative bg-white border border-gray-100 rounded-2xl p-6 
                   transition-all duration-300 ease-out
                   hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-red-500
                   flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Lớp nền mờ khi hover (tùy chọn) */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon Wrapper */}
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 
                          group-hover:bg-red-100 transition-colors duration-300">
            <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
              🗺️ 
            </span>
          </div>

          {/* Tên tỉnh thành */}
          <h3 className="font-extrabold text-gray-800 text-lg group-hover:text-red-600 transition-colors uppercase tracking-tight">
            {province.province_name}
          </h3>

          {/* Số lượng rạp dạng Badge */}
          <div className="mt-3 px-3 py-1 bg-gray-100 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
            <span className="text-xs font-bold uppercase tracking-wider">
              {cinemaCount} Rạp
            </span>
          </div>
        </div>

        {/* Đường kẻ đỏ dưới cùng khi hover */}
        <div className="absolute bottom-0 left-0 w-0 h-1 bg-red-600 group-hover:w-full transition-all duration-500" />
          </button>
       );
      })}
      </div>
            </div>
          ) : (
            /* Cinemas in Selected Province */
<div className="max-w-7xl mx-auto px-4">
  {/* Back Button - Làm lại cho sang hơn */}
  <button
    onClick={handleBackToProvinces}
    className="mb-8 flex items-center gap-2 group text-gray-500 hover:text-red-600 transition-colors"
  >
    <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-red-50 transition-colors">
      <ArrowLeftOutlined /> {/* Hoặc <ChevronLeft size={20} /> */}
    </div>
    <span className="font-semibold text-sm uppercase tracking-wider">Quay lại chọn tỉnh thành</span>
  </button>

  {/* Header Section */}
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-3">
      Rạp CGV tại <span className="text-red-600">{selectedProvince}</span>
    </h2>
    <div className="flex items-center justify-center gap-2">
      <span className="h-[2px] w-8 bg-red-600"></span>
      <p className="text-gray-500 font-medium uppercase text-sm tracking-widest">
        {filteredCinemas.length} Địa điểm đang hoạt động
      </p>
      <span className="h-[2px] w-8 bg-red-600"></span>
    </div>
  </div>

  {filteredCinemas.length === 0 ? (
    <div className="bg-white rounded-3xl p-20 shadow-sm text-center border border-dashed border-gray-200">
      <Empty description={<span className="text-gray-400 font-medium">Hiện tại chưa có rạp CGV nào tại khu vực này</span>} />
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCinemas.map((cinema) => (
        <div 
          key={cinema.id} 
          className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col"
        >
          {/* Accent Line */}
          <div className="h-1.5 w-full bg-red-600"></div>

          <div className="p-6 flex-grow">
            <h3 className="text-xl font-extrabold text-gray-800 mb-4 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[3.5rem] uppercase">
              {cinema.cinema_name}
            </h3>

            <div className="space-y-4">
              {/* Địa chỉ */}
              <div className="flex gap-3">
                <div className="mt-1">
                  <EnvironmentOutlined className="text-red-600 text-lg" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ</p>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium line-clamp-3">
                    {cinema.address}
                  </p>
                </div>
              </div>

              {/* Hotline */}
              {cinema.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-5 flex justify-center text-red-600">
                    <PhoneOutlined />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hotline</p>
                    <p className="text-sm text-gray-800 font-bold">{cinema.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Card */}
          <div className="p-6 pt-0 mt-auto">
            <Link href={`/cgv/cinemas/${cinema.id}`} className="block">
              <button className="w-full bg-gray-900 group-hover:bg-red-600 text-white py-3 rounded-xl transition-all duration-300 font-bold text-sm uppercase tracking-widest shadow-lg shadow-gray-200 group-hover:shadow-red-200">
                Xem Lịch Chiếu
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
          )}
        </div>
      </div>

      <CGVFooter />
    </>
  );
}
