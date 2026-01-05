'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Alert, Breadcrumb } from 'antd';
import { CalendarOutlined, HomeOutlined, ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

// Interface dữ liệu tin tức
interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  create_at: Date;
  update_at: Date;
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Logic lấy dữ liệu (Giữ nguyên logic của bạn)
  useEffect(() => {
    params.then(p => {
      fetchNewsDetail(p.id);
    });
  }, [params]);

  const fetchNewsDetail = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/${id}`);
      if (!response.ok) {
        throw new Error('Không tìm thấy tin tức');
      }
      const data = await response.json();
      setNews(data);
    } catch (err) {
      console.error('Error fetching news detail:', err);
      setError('Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // 2. Màn hình Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf0] flex flex-col">
        <CGVHeader />
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Spin size="large" />
              <span className="text-gray-600 font-bold">Đang tải tin tức...</span>
            </div>
        <CGVFooter />
      </div>
    );
  }

  // 3. Màn hình Lỗi
  if (error || !news) {
    return (
      <div className="min-h-screen bg-[#fdfcf0] flex flex-col">
        <CGVHeader />
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <Alert message="Thông báo" description={error || 'Tin tức không tồn tại'} type="error" showIcon className="mb-4" />
                <button onClick={() => router.push('/news')} className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700">
                    Quay lại danh sách
                </button>
            </div>
        </div>
        <CGVFooter />
      </div>
    );
  }

  // 4. GIAO DIỆN CHÍNH (Đã fix lỗi díu chữ)
  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        
        {/* Breadcrumb Bar - Dính lên trên */}
          <div className="bg-white border-b-2 border-red-600 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors">
                🏠
              </Link>
              <span className="text-gray-400">›</span>
              <Link href="/news" className="text-gray-600 hover:text-red-600 transition-colors">
                Tin Mới & Ưu Đãi
              </Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 font-bold line-clamp-1">{news.title}</span>
            </div>
          </div>
        </div>

        {/* Layout Chính: Chia cột 5/7 */}
        <div className="container mx-auto px-4 py-10 max-w-7xl">
          
          {/* Tiêu đề bài viết */}
          <div className="text-center mb-10 border-b border-gray-300 pb-6">
            <h1 className="text-3xl md:text-5xl font-black text-[#2b2b2b] uppercase tracking-wide leading-tight mb-4">
                {news.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-gray-500 text-sm font-medium">
                <span className="flex items-center gap-2">
                    <CalendarOutlined className="text-red-600 text-lg" /> 
                    {formatDate(news.create_at)}
                </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* --- CỘT TRÁI: ẢNH (Sticky) --- */}
            <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="sticky top-24 space-y-6"> 
                    <div className="rounded-xl overflow-hidden border-4 border-white shadow-xl bg-white relative">
                        {news.image_url ? (
                        <img 
                            src={news.image_url} 
                            alt={news.title} 
                            className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-100 text-gray-400 font-bold">NO IMAGE</div>
                        )}
                        <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded uppercase shadow-md">
                            Khuyến mãi
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CỘT PHẢI: NỘI DUNG (Content) --- */}
            <div className="lg:col-span-7 order-1 lg:order-2">
                <div className="bg-[#fdfcf0] p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    
                    {/* QUAN TRỌNG: Class cgv-content-body sẽ xử lý việc díu chữ */}
                    <div 
                        className="cgv-content-body text-gray-800 text-justify"
                        dangerouslySetInnerHTML={{ __html: news.content }}
                    />

                    {/* Nút hành động */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/cgv/movies" className="flex-1 bg-red-600 text-white py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition-all text-center uppercase tracking-wider">
                            Đặt vé ngay
                        </Link>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>

      <CGVFooter />

      {/* --- PHẦN STYLE FIX DÍU CHỮ --- */}
      <style jsx global>{`
        /* Reset cơ bản cho vùng nội dung */
        .cgv-content-body {
            font-size: 16px;
            line-height: 1.8; /* Tăng khoảng cách dòng để dễ đọc */
            color: #333;
        }

        /* Tự động thêm khoảng cách giữa các đoạn văn */
        .cgv-content-body p {
            margin-bottom: 1rem !important; 
            display: block;
        }

        /* Xử lý danh sách (dấu chấm đầu dòng bị mất) */
        .cgv-content-body ul {
            list-style-type: disc !important; /* Bắt buộc hiện dấu chấm */
            padding-left: 2rem !important;    /* Thụt đầu dòng */
            margin-bottom: 1rem !important;
        }
        .cgv-content-body li {
            margin-bottom: 0.5rem !important; /* Cách nhau giữa các ý */
        }

        /* Xử lý tiêu đề con (in đậm) */
        .cgv-content-body h2, 
        .cgv-content-body h3, 
        .cgv-content-body strong,
        .cgv-content-body b {
            font-weight: 700 !important;
            color: #2b2b2b;
            margin-top: 1.5rem !important;
            margin-bottom: 0.5rem !important;
            display: block;
        }

        /* Link màu đỏ */
        .cgv-content-body a {
            color: #dc2626;
            text-decoration: underline;
            font-weight: bold;
        }

        /* Trường hợp database lưu text thuần (xuống dòng bằng \n) */
        .cgv-content-body {
            white-space: pre-line; 
        }
        /* Nếu database lưu HTML (có thẻ p, br) thì reset lại white-space */
        .cgv-content-body p, 
        .cgv-content-body div, 
        .cgv-content-body ul {
            white-space: normal;
        }
      `}</style>
    </>
  );
}