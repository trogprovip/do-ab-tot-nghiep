/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { 
  PlayCircleFilled, 
  ShoppingCartOutlined
} from '@ant-design/icons';
import { Spin } from 'antd';
import Link from 'next/link';

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  const fetchMovie = async () => {
    try {
      setLoading(true);
      const data = await movieService.getMovie(parseInt(movieId));
      setMovie(data);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <>
        <CGVHeader />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600 font-bold">Đang tải thông tin phim...</p>
          </div>
        </div>
        <CGVFooter />
      </>
    );
  }

  if (!movie) {
    return (
      <>
        <CGVHeader />
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phim</h1>
          <Link href="/cgv">
            <button className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-all">
              Quay về trang chủ
            </button>
          </Link>
        </div>
        <CGVFooter />
      </>
    );
  }

  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailer_url);

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-white">
        {/* Page Title */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Nội Dung Phim</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Poster - Left Column */}
              <div className="lg:col-span-3">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full shadow-lg"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center">
                    <PlayCircleFilled className="text-6xl text-gray-400" />
                  </div>
                )}
              </div>

              {/* Movie Info - Right Column */}
              <div className="lg:col-span-9">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
                  {movie.title}
                </h1>

                {/* Movie Details */}
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Đạo diễn:</span>
                    <span className="text-gray-600">{movie.director || 'Đang cập nhật'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Diễn viên:</span>
                    <span className="text-gray-600">{movie.cast || 'Đang cập nhật'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Thể loại:</span>
                    <span className="text-gray-600">{movie.genre || 'Đang cập nhật'}</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Thời lượng:</span>
                    <span className="text-gray-600">{movie.duration} phút</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Ngôn ngữ:</span>
                    <span className="text-gray-600">{movie.language || 'Tiếng Anh'} - Phụ đề Tiếng Việt</span>
                  </div>
                  <div className="flex">
                    <span className="font-bold text-gray-700 w-32">Rated:</span>
                    <span className="text-gray-600">{movie.age_rating || 'T13'} - PHIM ĐƯỢC PHỔ BIẾN ĐẾN NGƯỜI XEM TỪ ĐỦ 13 TUỔI TRỞ LÊN (13+)</span>
                  </div>
                </div>

                {/* Format Badges */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  <div className="border-2 border-gray-300 px-3 py-1 text-xs font-bold text-gray-700">2D</div>
                  <div className="border-2 border-blue-500 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50">3D</div>
                  <div className="border-2 border-gray-300 px-3 py-1 text-xs font-bold text-gray-700">4DX</div>
                  <div className="border-2 border-gray-300 px-3 py-1 text-xs font-bold text-gray-700">IMAX</div>
                  <div className="border-2 border-gray-300 px-3 py-1 text-xs font-bold text-gray-700">SCREENX</div>
                  <div className="border-2 border-orange-500 px-3 py-1 text-xs font-bold text-orange-600 bg-orange-50">STARIUM</div>
                  <div className="border-2 border-gray-300 px-3 py-1 text-xs font-bold text-gray-700">ULTRA 4DX</div>
                </div>

                {/* Social & Buttons */}
                <div className="flex gap-3 mb-6">
                  <Link href={`/cgv/movies/${movie.id}/showtimes`}>
                    <button className="bg-red-600 text-white px-6 py-2 font-bold hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-red-600/50">
                      <ShoppingCartOutlined />
                      MUA VÉ
                    </button>
                  </Link>
                  
                  {trailerEmbedUrl && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-purple-600/50"
                    >
                      <PlayCircleFilled />
                      XEM TRAILER
                    </button>
                  )}
                </div>

                {/* Description */}
                {movie.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-700 leading-relaxed text-justify">
                      {movie.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerEmbedUrl && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-6xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-14 right-0 text-white hover:text-red-500 transition-colors text-2xl font-black flex items-center gap-2"
            >
              <span>✕</span> ĐÓNG
            </button>
            <iframe
              src={`${trailerEmbedUrl}?autoplay=1`}
              className="w-full h-full rounded-2xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <CGVFooter />
    </>
  );
}
