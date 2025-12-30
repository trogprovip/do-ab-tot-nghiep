'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import NewsForm from '@/components/NewsForm';
import { newsService, CreateNewsForm } from '@/lib/services/newsService';

export default function CreateNewsPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateNewsForm) => {
    try {
      await newsService.createNews(data);
      alert('Thêm tin tức thành công!');
      router.push('/admin/news');
    } catch (error) {
      console.error('Error creating news:', error);
      throw new Error('Có lỗi xảy ra khi thêm tin tức');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm tin tức mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm tin tức mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <NewsForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
