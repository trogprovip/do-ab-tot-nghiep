'use client';

import React, { useState } from 'react';
import { CreateProvinceDto, UpdateProvinceDto } from '@/lib/services/provinceService';

interface ProvinceFormProps {
  initialData?: UpdateProvinceDto & { id?: number };
  onSubmit: (data: CreateProvinceDto | UpdateProvinceDto) => Promise<void>;
  isEditing?: boolean;
}

export default function ProvinceForm({ initialData, onSubmit, isEditing = false }: ProvinceFormProps) {
  const [formData, setFormData] = useState<CreateProvinceDto | UpdateProvinceDto>({
    province_name: initialData?.province_name || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu tỉnh/thành phố');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tên tỉnh/thành phố <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="province_name"
          value={formData.province_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Hồ Chí Minh, Hà Nội, Đà Nẵng..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
