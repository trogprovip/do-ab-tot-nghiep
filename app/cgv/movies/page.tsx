'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty, Pagination } from 'antd';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined, 
  StarFilled,
  ClockCircleOutlined,
  FireFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function AllMoviesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status') || 'all';
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchMovies();
  }, [currentPage, status]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies({
        page: currentPage,
        size: pageSize,
        status: status === 'all' ? undefined : status,
      });
      setMovies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    // Lưu vị trí scroll hiện tại
    const scrollY = window.scrollY;
    
    setCurrentPage(0);
    if (key === 'all') {
      router.push('/cgv/movies');
    } else {
      router.push(`/cgv/movies?status=${key}`);
    }
    
    // Khôi phục vị trí scroll sau khi navigation
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    },40);  
  };

  const getRatingBadge = (status: string | null) => 'T16';
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Đang cập nhật';

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Page Header */}
<div className="relative py-20 bg-[#fdfcf0] overflow-hidden border-b border-red-100">
  {/* 1. Background Decor: Chữ CINEMA mờ làm nền */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
    <span className="text-[120px] md:text-[180px] font-black text-gray-900/5 tracking-widest uppercase leading-none whitespace-nowrap">
      CINEMA
    </span>
  </div>

  {/* 2. Content Chính */}
  <div className="container mx-auto px-4 text-center relative z-10">
    {/* Label nhỏ bên trên */}
    <div className="inline-flex items-center gap-2 mb-4 bg-white/80 backdrop-blur-sm border border-red-100 px-4 py-1 rounded-full shadow-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
      <span className="text-[10px] font-bold tracking-[0.3em] text-red-600 uppercase">CGV Catalog</span>
      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
    </div>

    {/* Tiêu đề chính cách điệu */}
    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter flex flex-col md:block items-center justify-center gap-2 md:gap-4 mb-4">
      <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-red-800 drop-shadow-sm">
        MOVIES
      </span>
      {/* Chữ SELECTION dạng Outline (Viền) */}
      <span className="text-[#2b2b2b] md:ml-4 relative">
        SELECTION
        {/* Dấu gạch chân nghệ thuật */}
        <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-400" viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.6" />
        </svg>
      </span>
    </h1>
  </div>
</div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Filter Tabs */}
          <div className="mb-8 flex gap-3 flex-wrap">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${status === 'all'? 'bg-red-600 text-white shadow-lg scale-105': 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
            >
              <StarFilled className="mr-2" />
              Tất Cả Phim
            </button>
            <button
              onClick={() => handleTabChange('now_showing')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${status === 'now_showing'? 'bg-red-600 text-white shadow-lg scale-105': 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
            >
              <PlayCircleFilled className="mr-2" />
              Phim Đang Chiếu
            </button>
            <button
              onClick={() => handleTabChange('coming_soon')}
              className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${status === 'coming_soon'? 'bg-red-600 text-white shadow-lg scale-105': 'bg-white text-gray-700 hover:bg-red-50 border-2 border-gray-200'}`}
            >
              <ClockCircleOutlined className="mr-2" />
              Phim Sắp Chiếu
            </button>
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
            <>
              <div className="mb-8 flex items-center gap-3 pl-4 border-l-4 border-red-600">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Số lượng phim</span>
                <span className="text-3xl font-black text-gray-800 leading-none">{totalElements}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {movies.map((movie) => (
                  <div 
                    key={movie.id}
                    className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-red-500 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-2"
                  >
                    {/* Poster Area */}
                    <div className="relative aspect-[2/3] overflow-hidden cursor-pointer">
                      {/* Badge Rating */}
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

                      {/* Overlay gradient khi hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Button Play giữa hình */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 z-10">
                        <Link href={`/cgv/movies/${movie.id}`}>
                          <button className="w-16 h-16 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:scale-110 transition-all backdrop-blur-sm">
                            <PlayCircleFilled className="text-4xl ml-1" />
                          </button>
                        </Link>
                      </div>

                      {/* Release Date Tag */}
                      <div className="absolute bottom-3 right-3 z-20 bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded shadow-sm transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 border border-yellow-300">
                        {formatDate(movie.release_date)}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 relative">
                      <h3 className="font-black text-lg text-gray-900 mb-1 line-clamp-1 group-hover:text-red-600 transition-colors" title={movie.title}>
                        {movie.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-5 line-clamp-1 font-medium">
                        {movie.genre || 'Thể loại: Đang cập nhật'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Link href={`/cgv/movies/${movie.id}`}>
                          <button className="w-full py-2.5 rounded-xl text-sm font-bold border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300">
                            CHI TIẾT
                          </button>
                        </Link>
                        <Link href={`/cgv/movies/${movie.id}/showtimes`}>
                          <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg hover:shadow-red-500/30 hover:to-red-400 transition-all duration-300 flex items-center justify-center gap-1 group/btn">
                            <ShoppingCartOutlined className="group-hover/btn:animate-bounce"/> MUA VÉ
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    current={currentPage + 1}
                    total={totalElements}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page - 1)}
                    showSizeChanger={false}
                    className="cgv-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CGVFooter />

      <style jsx global>{`.cgv-pagination .ant-pagination-item-active {background: #d90000;border-color: #d90000;}.cgv-pagination .ant-pagination-item-active a {color: white;}.cgv-pagination .ant-pagination-item:hover {border-color: #d90000;}.cgv-pagination .ant-pagination-item:hover a {color: #d90000;} `}</style>
    </>
  );
}
