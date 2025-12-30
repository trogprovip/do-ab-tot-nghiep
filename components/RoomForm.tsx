'use client';

import React, { useState, useEffect } from 'react';
import { CreateRoomForm, UpdateRoomForm } from '@/lib/services/roomService';
import { cinemaService } from '@/lib/services/cinemaService';

interface Cinema {
  id: number;
  cinema_name: string;
}

interface RoomFormProps {
  initialData?: UpdateRoomForm & { id?: number; cinema_id?: number };
  onSubmit: (data: CreateRoomForm | UpdateRoomForm) => Promise<void>;
  isEditing?: boolean;
}

export default function RoomForm({ initialData, onSubmit, isEditing = false }: RoomFormProps) {
  const [formData, setFormData] = useState<CreateRoomForm | UpdateRoomForm>({
    cinema_id: initialData?.cinema_id || 0,
    room_name: initialData?.room_name || '',
    room_type: initialData?.room_type || '',
    total_seats: initialData?.total_seats || 0,
    status: initialData?.status || 'active',
  });

  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      const response = await cinemaService.getCinemas({ page: 0, size: 100 });
      setCinemas(response.content);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cinema_id' || name === 'total_seats' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu phòng chiếu');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rạp chiếu <span className="text-red-500">*</span>
          </label>
          <select
            name="cinema_id"
            value={formData.cinema_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn rạp chiếu</option>
            {cinemas.map(cinema => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.cinema_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên phòng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="room_name"
            value={formData.room_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: Phòng 1, Phòng VIP"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại phòng
          </label>
          <input
            type="text"
            name="room_type"
            value={formData.room_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: Standard, VIP, IMAX, 4DX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tổng số ghế <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="total_seats"
            value={formData.total_seats}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật phòng' : 'Thêm phòng')}
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
