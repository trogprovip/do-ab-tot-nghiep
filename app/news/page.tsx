'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty, Pagination, Input } from 'antd';
import { SearchOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  create_at: Date;
  update_at: Date;
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 12;

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/news?page=${currentPage}&size=${pageSize}&search=${searchTerm}`
      );
      const data = await response.json();
      setNews(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Breadcrumb */}
        <div className="bg-white border-b-2 border-red-600 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors">
                🏠
              </Link>
              <span className="text-gray-400">›</span>
              <span className="text-gray-800 font-bold">Tin Mới & Ưu Đãi</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-[#fdfcf0] py-8 border-b-4 border-red-600">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#2b2b2b] mb-2" style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '2px' }}>
              TIN MỚI VÀ ƯU ĐÃI
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="container mx-auto px-4 py-6">
          <Input
            size="large"
            placeholder="Tìm kiếm tin tức..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="max-w-md"
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Spin size="large" />
              <span className="text-gray-600 font-bold">Đang tải tin tức...</span>
            </div>
          ) : news.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <Empty description={<span className="text-gray-600 font-bold">Không có tin tức nào</span>} />
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-700 font-bold">
                Tìm thấy <span className="text-red-600">{totalElements}</span> tin tức
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {news.map((item) => (
                  <Link
                    key={item.id}
                    href={`/news/${item.id}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=CGV+News';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white text-4xl font-black">
                          CGV
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CalendarOutlined />
                        {formatDate(item.create_at)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors uppercase leading-tight" style={{ minHeight: '2.5rem' }}>
                        {item.title}
                      </h3>
                      <div className="text-xs text-gray-600 line-clamp-3 mb-3 leading-relaxed">
                        {(() => {
                          const cleanText = item.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                          const maxLength = 120;
                          if (cleanText.length <= maxLength) {
                            return cleanText;
                          }
                          const truncated = cleanText.substring(0, maxLength);
                          const lastSpaceIndex = truncated.lastIndexOf(' ');
                          return lastSpaceIndex > maxLength * 0.8 
                            ? truncated.substring(0, lastSpaceIndex) + '...'
                            : truncated + '...';
                        })()}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                        <span className="flex items-center gap-1">
                          <EyeOutlined />
                          Xem chi tiết
                        </span>
                        <span className="text-red-600 font-bold group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={currentPage + 1}
                    total={totalElements}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page - 1)}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CGVFooter />

      <style jsx global>{`
        .custom-pagination .ant-pagination-item-active {
          background-color: #dc2626;
          border-color: #dc2626;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        .custom-pagination .ant-pagination-item:hover {
          border-color: #dc2626;
        }
        .custom-pagination .ant-pagination-item:hover a {
          color: #dc2626;
        }
      `}</style>
    </>
  );
}
