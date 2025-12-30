'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProvinceForm from '@/components/ProvinceForm';
import { provinceService, UpdateProvinceDto, Province } from '@/lib/services/provinceService';

interface EditProvincePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProvincePage({ params }: EditProvincePageProps) {
  const resolvedParams = React.use(params);
  const provinceId = parseInt(resolvedParams.id);

  const [province, setProvince] = useState<UpdateProvinceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProvince();
  }, [provinceId]);

  const fetchProvince = async () => {
    try {
      setLoading(true);
      const data: Province = await provinceService.getProvince(provinceId);
      
      setProvince({
        province_name: data.province_name,
      });
    } catch (err) {
      console.error('Error fetching province:', err);
      setError('Không thể tải thông tin tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateProvinceDto) => {
    try {
      await provinceService.updateProvince(provinceId, data);
      alert('Cập nhật tỉnh/thành phố thành công!');
      router.push('/admin/provinces');
    } catch (err) {
      console.error('Error updating province:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !province) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Không tìm thấy thông tin tỉnh/thành phố'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa tỉnh/thành phố</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin tỉnh/thành phố trong hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ProvinceForm 
          initialData={province} 
          onSubmit={handleSubmit} 
          isEditing={true}
        />
      </div>
    </div>
  );
}
