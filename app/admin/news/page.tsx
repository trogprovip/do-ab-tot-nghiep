'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { newsService, News } from '@/lib/services/newsService';

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNews();
  }, [searchTerm]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await newsService.getNews({
        page: 0,
        size: 100,
        search: searchTerm || undefined,
      });
      setNews(response.content);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: News) => {
    router.push(`/admin/news/edit/${row.id}`);
  };

  const handleDelete = async (row: News) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      return;
    }

    try {
      await newsService.deleteNews(row.id);
      alert('Xóa tin tức thành công!');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      alert('Có lỗi xảy ra khi xóa tin tức!');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'image_url', 
      label: 'Hình ảnh',
      render: (value: string | null) => (
        value ? (
          <img 
            src={value} 
            alt="News" 
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No image</div>
        )
      )
    },
    { key: 'title', label: 'Tiêu đề' },
    { 
      key: 'content', 
      label: 'Nội dung',
      render: (value: string) => value.length > 100 ? value.substring(0, 100) + '...' : value
    },
    { 
      key: 'create_at', 
      label: 'Ngày tạo',
      render: (value: string | null) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tin tức</h1>
        <Link href="/admin/news/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm tin tức
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={news}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
