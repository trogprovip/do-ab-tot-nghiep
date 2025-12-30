'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm';
import { productService, CreateProductForm } from '@/lib/services/productService';

export default function CreateProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProductForm) => {
    try {
      await productService.createProduct(data);
      alert('Thêm sản phẩm thành công!');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Có lỗi xảy ra khi thêm sản phẩm');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm sản phẩm mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
