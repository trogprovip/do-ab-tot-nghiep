'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import { provinceService, Province, ProvinceFilterParams } from '@/lib/services/provinceService';

export default function ProvincesPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProvinces();
  }, [searchTerm]);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      
      const params: ProvinceFilterParams = {
        search: searchTerm || undefined,
        page: 0,
        size: 100
      };
      
      const data = await provinceService.getProvinces(params);
      setProvinces(data.content || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (province: Province) => {
    if (!confirm(`Bạn có chắc muốn xóa "${province.province_name}"?`)) return;
    
    try {
      await provinceService.deleteProvince(province.id);
      alert('Xóa tỉnh/thành phố thành công!');
      fetchProvinces();
    } catch (error) {
      console.error('Error deleting province:', error);
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  const handleEdit = (province: Province) => {
    window.location.href = `/admin/provinces/edit/${province.id}`;
  };

  const handleCreate = () => {
    window.location.href = '/admin/provinces/create';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'province_name', label: 'Tên tỉnh/thành phố' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tỉnh/Thành phố</h1>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm tỉnh/thành phố
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên tỉnh/thành phố..."
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
          data={provinces}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onView={(province) => handleEdit(province)}
        />
      )}
    </div>
  );
}
