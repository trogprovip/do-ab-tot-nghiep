'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import axios from 'axios';

interface SeatType {
  id: number;
  type_name: string;
  price_multiplier: number;
  description: string | null;
  is_deleted: boolean;
}

export default function SeatTypesPage() {
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    type_name: '',
    price_multiplier: 1.0,
    description: '',
  });

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  const fetchSeatTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/seat-types');
      if (response.data.success) {
        setSeatTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
      alert('Lỗi khi tải danh sách loại ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/seat-types/${editingId}`, formData);
        alert('Cập nhật loại ghế thành công!');
      } else {
        await axios.post('/api/seat-types', formData);
        alert('Tạo loại ghế thành công!');
      }
      setShowModal(false);
      resetForm();
      fetchSeatTypes();
    } catch (error) {
      console.error('Error saving seat type:', error);
      alert('Lỗi khi lưu loại ghế');
    }
  };

  const handleEdit = (seatType: SeatType) => {
    setEditingId(seatType.id);
    setFormData({
      type_name: seatType.type_name,
      price_multiplier: Number(seatType.price_multiplier),
      description: seatType.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại ghế này?')) return;
    
    try {
      await axios.delete(`/api/seat-types/${id}`);
      alert('Xóa loại ghế thành công!');
      fetchSeatTypes();
    } catch (error) {
      console.error('Error deleting seat type:', error);
      alert('Lỗi khi xóa loại ghế');
    }
  };

  const resetForm = () => {
    setFormData({
      type_name: '',
      price_multiplier: 1.0,
      description: '',
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getSeatTypeColor = (typeName: string) => {
    const name = typeName.toLowerCase();
    if (name.includes('vip')) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    if (name.includes('couple') || name.includes('đôi')) return 'bg-gradient-to-r from-pink-500 to-rose-500';
    if (name.includes('standard') || name.includes('thường')) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Loại Ghế</h1>
          <p className="text-gray-500 mt-1">Cấu hình các loại ghế và hệ số giá</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Thêm Loại Ghế
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seatTypes.map((seatType) => (
          <div
            key={seatType.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
          >
            <div className={`h-2 ${getSeatTypeColor(seatType.type_name)}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${getSeatTypeColor(seatType.type_name)} flex items-center justify-center shadow-md`}>
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{seatType.type_name}</h3>
                    <p className="text-sm text-gray-500">Hệ số giá: x{seatType.price_multiplier}</p>
                  </div>
                </div>
              </div>

              {seatType.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {seatType.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(seatType)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(seatType.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {seatTypes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có loại ghế nào</h3>
          <p className="text-gray-500 mb-6">Tạo loại ghế đầu tiên để bắt đầu</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            Thêm Loại Ghế
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa Loại Ghế' : 'Thêm Loại Ghế Mới'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Loại Ghế <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.type_name}
                  onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
                  placeholder="VD: VIP, Standard, Couple..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hệ Số Giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="5"
                  value={formData.price_multiplier}
                  onChange={(e) => setFormData({ ...formData, price_multiplier: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Giá ghế = Giá vé cơ bản × Hệ số giá (VD: 1.5 = +50%)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô Tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về loại ghế này..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
                >
                  {editingId ? 'Cập Nhật' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
