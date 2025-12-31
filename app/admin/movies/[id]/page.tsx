'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { movieService, Movie } from '@/lib/services/movieService';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Film, 
  Star, 
  Users, 
  Globe, 
  Tag,
  Play,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function MovieDetailPage() {
  const router = useRouter();
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
      alert('Không thể tải thông tin phim');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!movie || !confirm(`Bạn có chắc chắn muốn xóa phim "${movie.title}"?`)) {
      return;
    }

    try {
      await movieService.deleteMovie(movie.id);
      alert('Xóa phim thành công!');
      router.push('/admin/movies');
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Có lỗi xảy ra khi xóa phim!');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'now_showing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'coming_soon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'now_showing':
        return 'Đang chiếu';
      case 'coming_soon':
        return 'Sắp chiếu';
      case 'ended':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phim</h1>
        <Link href="/admin/movies">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Quay lại danh sách
          </button>
        </Link>
      </div>
    );
  }

  const trailerEmbedUrl = getYouTubeEmbedUrl(movie.trailer_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Actions */}
      <div className="bg-white border-b border-gray-200 top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Quay lại</span>
            </button>

            <div className="flex items-center gap-3">
              <Link href={`/admin/movies/edit/${movie.id}`}>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Xóa phim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
            {/* Poster */}
            <div className="lg:col-span-1">
              <div className="relative group">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full rounded-xl shadow-2xl object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-2xl">
                    <Film className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 shadow-lg ${getStatusColor(movie.status)}`}>
                    {getStatusText(movie.status)}
                  </span>
                </div>

                {/* Trailer Button */}
                {trailerEmbedUrl && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    <span className="font-bold">Xem Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                  {movie.title}
                </h1>

                {/* Rating */}
                {movie.rating && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1 bg-yellow-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-bold text-yellow-700">{movie.rating}/10</span>
                    </div>
                    {movie.age_rating && (
                      <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold border-2 border-orange-200">
                        {movie.age_rating}
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Thời lượng</p>
                      <p className="text-lg font-bold text-gray-900">{movie.duration} phút</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Khởi chiếu</p>
                      <p className="text-lg font-bold text-gray-900">
                        {movie.release_date 
                          ? new Date(movie.release_date).toLocaleDateString('vi-VN')
                          : 'Chưa xác định'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Tag className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Thể loại</p>
                      <p className="text-lg font-bold text-gray-900">{movie.genre || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <Globe className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Ngôn ngữ</p>
                      <p className="text-lg font-bold text-gray-900">{movie.language || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {movie.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Film className="w-5 h-5 text-blue-600" />
                      Nội dung phim
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-justify bg-gray-50 p-4 rounded-xl border border-gray-200">
                      {movie.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Director & Cast */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Đạo diễn & Diễn viên
            </h3>
            
            {movie.director && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-medium mb-1">Đạo diễn</p>
                <p className="text-lg font-semibold text-gray-900">{movie.director}</p>
              </div>
            )}

            {movie.cast && (
              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">Diễn viên</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.split(',').map((actor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {actor.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin kỹ thuật</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">ID Phim</span>
                <span className="text-gray-900 font-bold">#{movie.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Ngày tạo</span>
                <span className="text-gray-900 font-semibold">
                  {movie.create_at 
                    ? new Date(movie.create_at).toLocaleDateString('vi-VN')
                    : 'N/A'
                  }
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Cập nhật lần cuối</span>
                <span className="text-gray-900 font-semibold">
                  {movie.update_at 
                    ? new Date(movie.update_at).toLocaleDateString('vi-VN')
                    : 'N/A'
                  }
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Trạng thái</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(movie.status)}`}>
                  {getStatusText(movie.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerEmbedUrl && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors text-lg font-bold"
            >
              ✕ Đóng
            </button>
            <iframe
              src={trailerEmbedUrl}
              className="w-full h-full rounded-xl shadow-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
