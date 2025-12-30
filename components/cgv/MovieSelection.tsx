/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Spin, Empty } from 'antd';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined, 
  StarFilled, 
  RightOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';

export default function MovieSelection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await movieService.getMovies({
          status: 'now_showing',
          page: 0,
          size: 8,
        });
        setMovies(response.content);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const getRatingBadge = (status: string | null) => 'T16'; 
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Đang cập nhật';

  return (
    <section className="py-16 bg-[#fdfcf0] relative overflow-hidden font-sans">
      
      {/* Background Decor - Vệt sáng nền ấm áp, rực rỡ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full bg-gradient-to-tr from-red-200/40 via-yellow-200/40 to-transparent blur-[100px] pointer-events-none"></div>
      
      {/* Họa tiết chấm bi mờ tạo texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d90000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Title - Style Màu Mè & Nổi Bật */}
        <div className="flex flex-col items-center mb-12">
            <span className="text-yellow-600 font-black tracking-[0.3em] text-sm uppercase mb-2 animate-pulse flex items-center gap-2">
                <StarFilled className="text-yellow-400" /> What On <StarFilled className="text-yellow-400" />
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-700 to-red-900 uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(220,38,38,0.3)]">
                PHIM ĐANG CHIẾU
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-4 rounded-full"></div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <Spin size="large" />
            <span className="text-gray-600 font-bold">Đang tải phim...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex justify-center items-center py-20">
             <Empty description={<span className="text-gray-600 font-bold">{error}</span>} />
          </div>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {movies.map((movie) => (
              <div 
                key={movie.id}
                className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-red-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-2"
              >
                {/* Poster Area */}
                <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                    {/* Badge Rating - Màu sắc hơn */}
                    <div className="absolute top-3 left-3 z-20">
                        <span className="bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md border-2 border-white/30">
                            {getRatingBadge(movie.status)}
                        </span>
                    </div>

                    {/* Image with Zoom Effect */}
                    {movie.poster_url ? (
                      <img 
                        src={movie.poster_url} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <PlayCircleFilled className="text-5xl" />
                      </div>
                    )}

                    {/* Overlay gradient khi hover - Sáng hơn */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Button Play giữa hình */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 z-10">
                        <Link href={`/movies/${movie.id}`}>
                            <button className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:scale-110 transition-all backdrop-blur-sm">
                                <PlayCircleFilled className="text-4xl ml-1" />
                            </button>
                        </Link>
                    </div>

                    {/* Release Date Tag - Màu vàng nổi bật */}
                    <div className="absolute bottom-3 right-3 z-20 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded shadow-sm transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 border border-yellow-300">
                        {formatDate(movie.release_date)}
                    </div>
                </div>

                {/* Content Area - Nền trắng, chữ đen */}
                <div className="p-5 relative">
                  <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-red-600 transition-colors" title={movie.title}>
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 line-clamp-1 font-medium">Thể loại: Hành động, Viễn tưởng...</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/movies/${movie.id}`}>
                      <button className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300">
                        CHI TIẾT
                      </button>
                    </Link>
                    <Link href={`/booking/${movie.id}`}>
                      <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:to-red-400 transition-all duration-300 flex items-center justify-center gap-1 group/btn">
                        <ShoppingCartOutlined className="group-hover/btn:animate-bounce"/> MUA VÉ
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button - Màu đỏ rực */}
        <div className="text-center mt-10">
          <Link href="/movies">
            <button className="group relative inline-flex items-center justify-center px-10 py-3.5 overflow-hidden font-black text-red-600 transition-all duration-300 bg-white border-2 border-red-600 rounded-full hover:bg-red-600 hover:text-white shadow-md hover:shadow-xl hover:shadow-red-600/20">
              <span className="mr-2 uppercase tracking-widest text-sm">Xem tất cả phim</span>
              <RightOutlined className="group-hover:translate-x-1 transition-transform text-lg" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
