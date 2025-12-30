'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewsForm from '@/components/NewsForm';
import { newsService, UpdateNewsForm } from '@/lib/services/newsService';

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<UpdateNewsForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsId, setNewsId] = useState<number | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setNewsId(parseInt(resolvedParams.id));
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (newsId) {
      fetchNews();
    }
  }, [newsId]);

  const fetchNews = async () => {
    if (!newsId) return;
    try {
      const news = await newsService.getNewsById(newsId);
      setInitialData({
        title: news.title,
        content: news.content,
        image_url: news.image_url || '',
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      alert('Không thể tải thông tin tin tức');
      router.push('/admin/news');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateNewsForm) => {
    if (!newsId) return;
    try {
      await newsService.updateNews(newsId, data);
      alert('Cập nhật tin tức thành công!');
      router.push('/admin/news');
    } catch (error) {
      console.error('Error updating news:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật tin tức');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-8">Không tìm thấy tin tức</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa tin tức</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin tin tức</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <NewsForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </div>
  );
}
