'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { productService, UpdateProductForm } from '@/lib/services/productService';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<UpdateProductForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<number | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setProductId(parseInt(resolvedParams.id));
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    try {
      const product = await productService.getProductById(productId);
      setInitialData({
        product_name: product.product_name,
        category: product.category,
        description: product.description || '',
        price: Number(product.price),
        image_url: product.image_url || '',
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Không thể tải thông tin sản phẩm');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateProductForm) => {
    if (!productId) return;
    try {
      await productService.updateProduct(productId, data);
      alert('Cập nhật sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật sản phẩm');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-8">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin sản phẩm</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProductForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </div>
  );
}