'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty, Pagination } from 'antd';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined, 
  StarFilled 
} from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

export default function AllMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    fetchMovies();
  }, [currentPage]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies({
        page: currentPage,
        size: pageSize,
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

  const getRatingBadge = (status: string | null) => 'T16';
  const formatDate = (date: Date | null) => date ? new Date(date).toLocaleDateString('vi-VN') : 'Đang cập nhật';

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight flex items-center gap-3">
              <StarFilled className="text-yellow-400" />
              TẤT CẢ PHIM
            </h1>
            <p className="text-red-100 mt-2 text-lg">Khám phá kho phim đa dạng tại CGV</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
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
              <div className="mb-6 text-gray-700 font-bold">
                Tìm thấy <span className="text-red-600">{totalElements}</span> phim
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
                        <Link href={`/cgv/booking?movie=${movie.id}`}>
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

      <style jsx global>{`
        .cgv-pagination .ant-pagination-item-active {
          background: #d90000;
          border-color: #d90000;
        }
        .cgv-pagination .ant-pagination-item-active a {
          color: white;
        }
        .cgv-pagination .ant-pagination-item:hover {
          border-color: #d90000;
        }
        .cgv-pagination .ant-pagination-item:hover a {
          color: #d90000;
        }
      `}</style>
    </>
  );
}
