'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { newsService, News } from '@/lib/services/newsService';

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchNews(params.id as string);
    }
  }, [params.id]);

  const fetchNews = async (id: string) => {
    try {
      setLoading(true);
      const data = await newsService.getNewsById(Number(id));
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Không tìm thấy tin tức!');
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/news');
  };

  const handleEdit = () => {
    router.push(`/admin/news/edit/${params.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tin tức...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy tin tức</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết Tin tức</h1>
        </div>
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Chỉnh sửa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Hình ảnh tin tức */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh tin tức</h2>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {news.image_url ? (
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Không có hình ảnh</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin tin tức */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tin tức</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <p className="text-gray-900 font-medium text-lg">{news.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {news.content || 'Không có nội dung'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-gray-600">
                    {news.create_at ? new Date(news.create_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
                  <p className="text-gray-600">
                    {news.update_at ? new Date(news.update_at).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  !news.is_deleted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {!news.is_deleted ? 'Hiển thị' : 'Đã xóa'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID tin tức</label>
                <p className="text-gray-600 font-mono">#{news.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
