/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import Link from 'next/link';
import { provinceService } from '@/lib/services/provinceService';
import { slotService } from '@/lib/services/slotService';

interface Province {
  id: number;
  province_name: string;
}

interface SlotWithDetails {
  id: number;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
  movies?: {
    id: number;
    title: string;
  };
  rooms?: {
    id: number;
    room_name: string;
    cinemas?: {
      id: number;
      cinema_name: string;
      address: string;
      province_id: number;
    };
  };
}

interface CinemaGroup {
  cinema_id: number;
  cinema_name: string;
  address: string;
  room_type: string;
  slots: SlotWithDetails[];
}

export default function MovieShowtimesPage({ params }: { params: Promise<{ id: string }> }) {
  const [movieId, setMovieId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cinemaGroups, setCinemaGroups] = useState<CinemaGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<Date[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id);
      setMovieId(id);
      console.log('🔍 Movie ID from URL:', id);
      fetchMovie(id);
    });
  }, [params]);

  const generateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateArray: Date[] = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dateArray.push(date);
    }
    setDates(dateArray);
    setSelectedDate(formatDateForAPI(today));
  };

  const fetchProvinces = async () => {
    try {
      const response = await provinceService.getProvinces({ size: 100 });
      setProvinces(response.content);
      if (response.content.length > 0) {
        setSelectedProvince(response.content[0].id);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchMovie = async (id: number) => {
    try {
      console.log('🔍 Fetching movie with ID:', id);
      const response = await fetch(`/api/movies/${id}`);
      console.log('🔍 Movie API response status:', response.status);
      const movieData = await response.json();
      console.log('🔍 Movie API response:', movieData);
      setSelectedMovie(movieData);
    } catch (error) {
      console.error('Error fetching movie:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params: any = {
        date: selectedDate,
        size: 1000,
      };
      if (selectedProvince) {
        params.province_id = selectedProvince;
      }
      if (movieId) {
        params.movie_id = movieId;
      }
      const response = await slotService.getSlots(params);
      console.log('Slots API Response:', JSON.stringify(response, null, 2));
      console.log('Params sent:', params);
      groupSlotsByCinema(response.content as SlotWithDetails[]);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateDates();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedDate && movieId) {
      fetchSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedProvince, movieId]);

  const groupSlotsByCinema = (slotsData: SlotWithDetails[]) => {
    const grouped: { [key: number]: CinemaGroup } = {};

    slotsData.forEach((slot) => {
      const cinemaId = slot.rooms?.cinemas?.id;
      if (!cinemaId) return;

      if (!grouped[cinemaId]) {
        grouped[cinemaId] = {
          cinema_id: cinemaId,
          cinema_name: slot.rooms?.cinemas?.cinema_name || '',
          address: slot.rooms?.cinemas?.address || '',
          room_type: slot.rooms?.room_name || 'Rạp 2D',
          slots: [],
        };
      }
      grouped[cinemaId].slots.push(slot);
    });

    setCinemaGroups(Object.values(grouped));
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date: Date): string => {
    return String(date.getDate()).padStart(2, '0');
  };

  const getDayName = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMonthName = (date: Date): string => {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    return months[date.getMonth()];
  };

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <>
      <CGVHeader />
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Selected Movie Header */}
        {selectedMovie && (
          <div className="bg-black text-white">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center gap-6">
                <img
                  src={selectedMovie.poster_url || 'https://via.placeholder.com/120x180?text=No+Image'}
                  alt={selectedMovie.title}
                  className="w-20 h-28 object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/120x180?text=No+Image';
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-red-500 mb-2">{selectedMovie.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>{selectedMovie.duration || '120'} phút</span>
                    <span>•</span>
                    <span>{selectedMovie.genre || 'Hành động'}</span>
                    <span>•</span>
                    <span>{selectedMovie.age_rating || 'P'}</span>
                  </div>
                  <p className="text-gray-400 mt-2 line-clamp-2">{selectedMovie.description || 'Chọn suất chiếu bên dưới để bắt đầu trải nghiệm.'}</p>
                </div>
                              </div>
            </div>
          </div>
        )}
        
        {/* Calendar Section */}
        <div className="bg-[#fdfcf0] border-b-2 border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarOutlined className="text-red-600 text-xl" />
              <h2 className="text-lg font-bold text-gray-800">Chọn ngày chiếu</h2>
            </div>
            <div className="relative">
              {/* Left Navigation Button */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:border-red-500 hover:text-red-600 transition-all"
              >
                <LeftOutlined className="text-xs" />
              </button>

              {/* Date Container */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-2 overflow-x-auto pb-2 px-10 scroll-smooth no-scrollbar"
              >
                {dates.map((date, index) => {
                  const dateStr = formatDateForAPI(date);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`shrink-0 min-w-[60px] px-3 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
                      }`}
                    >
                      <div className="text-xs font-medium">{getMonthName(date)}</div>
                      <div className="text-xs opacity-70">{getDayName(date)}</div>
                      <div className="text-2xl font-bold">{formatDateDisplay(date)}</div>
                    </button>
                  );
                })}
              </div>

              {/* Right Navigation Button */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:border-red-500 hover:text-red-600 transition-all"
              >
                <RightOutlined className="text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Province/City Section */}
        <div className="bg-[#fdfcf0] border-b-2 border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <EnvironmentOutlined className="text-red-600 text-xl" />
              <h2 className="text-lg font-bold text-gray-800">Chọn thành phố</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {provinces.map((province) => {
                const isSelected = province.id === selectedProvince;
                return (
                  <button
                    key={province.id}
                    onClick={() => setSelectedProvince(province.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-600'
                    }`}
                  >
                    {province.province_name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Showtimes Section */}
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : cinemaGroups.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Không có suất chiếu nào trong ngày này</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cinemaGroups.map((cinema) => (
<div 
  key={cinema.cinema_id} 
  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 group/card"
>
  {/* Header: Nền nhẹ nhàng hơn, thêm icon địa điểm */}
  <div className="bg-gradient-to-r from-gray-50 to-white p-5 border-b border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-extrabold text-xl text-gray-800 tracking-tight group-hover/card:text-red-600 transition-colors">
          {cinema.cinema_name}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-gray-500">
          <EnvironmentOutlined className="text-xs" /> {/* Cần import thêm icon này */}
          <p className="text-xs leading-relaxed line-clamp-1">{cinema.address}</p>
        </div>
      </div>
      {/* Badge loại phòng: Chuyển sang dạng outline hoặc soft background cho sang */}
      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
        {cinema.room_type}
      </span>
    </div>
  </div>

  <div className="p-5">
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
      Lịch chiếu hôm nay
    </p>
    
    <div className="flex flex-wrap gap-3">
      {cinema.slots
        .sort((a, b) => new Date(a.show_time).getTime() - new Date(b.show_time).getTime())
        .map((slot) => {
          // Logic màu sắc dựa trên số lượng ghế
          const isLowSeats = slot.empty_seats < 10;
          
          return (
            <Link key={slot.id} href={`/cgv/booking/${slot.id}`} className="block">
              <button className="relative overflow-hidden group/btn px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-white transition-all duration-200 active:scale-95 shadow-sm">
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-gray-400 group-hover/btn:text-red-500 transition-colors" />
                    <span className="font-bold text-lg text-gray-700 group-hover/btn:text-red-600">
                      {formatTime(slot.show_time)}
                    </span>
                  </div>
                  
                  <div className={`text-[10px] font-medium transition-colors ${
                    isLowSeats ? 'text-orange-500' : 'text-gray-400'
                  } group-hover/btn:text-gray-500`}>
                    {isLowSeats ? '🔥 Cực ít ghế' : `${slot.empty_seats} ghế trống`}
                  </div>
                </div>
                
                {/* Hiệu ứng hover giả: Một lớp nền chạy nhẹ */}
                <div className="absolute inset-0 bg-red-50 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 opacity-30" />
              </button>
            </Link>
          );
        })}
    </div>
  </div>
</div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CGVFooter />

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
}
