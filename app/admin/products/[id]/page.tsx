'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productService, Product } from '@/lib/services/productService';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      const data = await productService.getProductById(Number(id));
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Không tìm thấy sản phẩm!');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/products');
  };

  const handleEdit = () => {
    router.push(`/admin/products/edit/${params.id}`);
  };

  const categoryMap: Record<string, string> = {
    food: 'Đồ ăn',
    drink: 'Đồ uống',
    combo: 'Combo',
    voucher: 'Voucher',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy sản phẩm</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết Sản phẩm</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Hình ảnh sản phẩm */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
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

          {/* Thông tin sản phẩm */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                <p className="text-gray-900 font-medium">{product.product_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {categoryMap[product.category] || product.category}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                <p className="text-2xl font-bold text-green-600">
                  {product.price.toLocaleString('vi-VN')} đ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {product.description || 'Không có mô tả'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  !product.is_deleted 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {!product.is_deleted ? 'Hoạt động' : 'Đã xóa'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                <p className="text-gray-600">
                  {product.create_at ? new Date(product.create_at).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
