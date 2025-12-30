'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ProvinceForm from '@/components/ProvinceForm';
import { provinceService, CreateProvinceDto, UpdateProvinceDto } from '@/lib/services/provinceService';

export default function CreateProvincePage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProvinceDto | UpdateProvinceDto) => {
    try {
      await provinceService.createProvince(data as CreateProvinceDto);
      alert('Thêm tỉnh/thành phố thành công!');
      router.push('/admin/provinces');
    } catch (error) {
      console.error('Error creating province:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm tỉnh/thành phố mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm tỉnh/thành phố mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProvinceForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
