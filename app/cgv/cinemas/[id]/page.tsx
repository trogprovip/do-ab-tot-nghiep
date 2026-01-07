'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CalendarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

interface Cinema {
  id: number;
  cinema_name: string;
  address: string;
  phone: string;
  email: string;
  provinces: {
    province_name: string;
  };
}

interface Movie {
  id: number;
  title: string;
  poster_url: string;
  duration: number;
  genre: string;
}

interface Slot {
  id: number;
  start_time: string;
  price: number;
  rooms: {
    room_name: string;
  };
}

interface MovieWithSlots {
  movie: Movie;
  slots: Slot[];
}

export default function CinemaDetailPage() {
  const params = useParams();
  const cinemaId = params.id as string;
  
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [moviesWithSlots, setMoviesWithSlots] = useState<MovieWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    // Set initial date only on client side to avoid hydration mismatch
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    console.log('Today date (local):', todayStr); // Debug log
    setSelectedDate(todayStr);
  }, []);

  useEffect(() => {
    if (cinemaId && selectedDate) {
      fetchCinemaDetails();
      fetchMoviesAndSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinemaId, selectedDate]);

  const fetchCinemaDetails = async () => {
    try {
      console.log('Fetching cinema details for ID:', cinemaId);
      const response = await fetch(`/api/cinemas/${cinemaId}`);
      const data = await response.json();
      console.log('Cinema data received:', data);
      setCinema(data);
    } catch (error) {
      console.error('Error fetching cinema details:', error);
    }
  };

  const fetchMoviesAndSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cinemas/${cinemaId}/movies?date=${selectedDate}`);
      const data = await response.json();
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setMoviesWithSlots(data);
      } else {
        console.error('API response is not an array:', data);
        setMoviesWithSlots([]);
      }
    } catch (error) {
      console.error('Error fetching movies and slots:', error);
      setMoviesWithSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const getNext30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatDisplayDate = (date: Date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.getMonth() + 1
    };
  };

  const getMonthName = (date: Date) => {
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    return months[date.getMonth()];
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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
        {/* Cinema Header - Light Style */}
        {cinema ? (
          <div className="bg-[#fdfcf0] border-b-4 border-red-600 py-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="text-5xl md:text-6xl font-black uppercase tracking-wider text-gray-800 mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                    CINEMA
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                  {cinema.cinema_name}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <EnvironmentOutlined className="text-red-600" />
                    {cinema.address}
                  </span>
                  {cinema.phone && (
                    <span className="flex items-center gap-2">
                      <span>•</span>
                      <span>Hotline: {cinema.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#fdfcf0] border-b-4 border-red-600 py-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <div className="text-gray-500">Đang tải thông tin rạp...</div>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Date Selector - Style like hình 2 */}
          <div className="mb-8">
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
                className="flex gap-2 overflow-x-auto pb-3 px-10 scroll-smooth no-scrollbar"
              >
                {getNext30Days().map((date) => {  
                  const dateStr = formatDate(date);
                  const display = formatDisplayDate(date);
                  const isSelected = dateStr === selectedDate;
                  
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`shrink-0 min-w-[60px] px-3 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                      }`}
                    >
                      <div className="text-xs font-medium">{getMonthName(date)}</div>
                      <div className="text-xs opacity-70">{display.day}</div>
                      <div className="text-2xl font-bold">{display.date}</div>
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

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20 gap-4 bg-[#fdfcf0]">
              <Spin size="large" />
              <span className="text-gray-600 font-bold">Đang tải lịch chiếu...</span>
            </div>
          )}

          {/* Movies and Showtimes */}
          {!loading && (
            <>
              {moviesWithSlots.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <Empty description={<span className="text-gray-600 font-bold">Không có suất chiếu nào trong ngày này</span>} />
                </div>
              ) : (
                <div className="space-y-4">
                  {moviesWithSlots.map(({ movie, slots }) => (
                    <div key={movie.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-lg hover:border-red-500 transition-all duration-300">
                      <div className="p-4">
                        {/* Movie Title with Age Rating */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 uppercase flex-1">
                            {movie.title}
                          </h3>
                          <div className="bg-yellow-500 text-black px-2 py-1 rounded font-black text-xs">
                            T13
                          </div>
                        </div>

                        <div className="flex gap-4">
                          {/* Movie Poster */}
                          <div className="shrink-0">
                            <div className="w-32 h-44 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                              {movie.poster_url ? (
                                <img
                                  src={movie.poster_url}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  No Image
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Showtimes Section */}
                          <div className="flex-1">
                            {/* Movie Info */}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4">
                              <span className="flex items-center gap-1">
                                <ClockCircleOutlined className="text-red-600 text-xs" />
                                {movie.duration} phút
                              </span>
                              <span>•</span>
                              <span>{movie.genre}</span>
                            </div>

                            {/* Showtimes by Format */}
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-xs font-bold text-gray-700 mb-2">2D Phụ Đề Việt</h4>
                                <div className="flex flex-wrap gap-2">
                                  {slots.map((slot) => (
                                    <Link
                                      key={slot.id}
                                      href={`/cgv/booking/${slot.id}`}
                                      className="group"
                                    >
                                      <div className="bg-white hover:bg-red-600 border border-gray-300 hover:border-red-600 rounded-md px-3 py-1.5 transition-all duration-300 text-center min-w-[70px] shadow-sm hover:shadow-md">
                                        <div className="text-sm font-bold text-gray-800 group-hover:text-white">
                                          {formatTime(slot.start_time)}
                                        </div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CGVFooter />
    </>
  );
}
