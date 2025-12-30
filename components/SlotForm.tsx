'use client';

import React, { useState, useEffect } from 'react';
import { CreateSlotForm, UpdateSlotForm } from '@/lib/services/slotService';
import { movieService } from '@/lib/services/movieService';
import { roomService } from '@/lib/services/roomService';

interface Movie {
  id: number;
  title: string;
}

interface Room {
  id: number;
  room_name: string;
  cinemas?: {
    cinema_name: string;
  };
}

interface SlotFormProps {
  initialData?: UpdateSlotForm & { id?: number; movie_id?: number; room_id?: number };
  onSubmit: (data: CreateSlotForm | UpdateSlotForm) => Promise<void>;
  isEditing?: boolean;
}

export default function SlotForm({ initialData, onSubmit, isEditing = false }: SlotFormProps) {
  const [formData, setFormData] = useState<CreateSlotForm | UpdateSlotForm>({
    movie_id: initialData?.movie_id || 0,
    room_id: initialData?.room_id || 0,
    show_time: initialData?.show_time || '',
    end_time: initialData?.end_time || '',
    price: initialData?.price || 0,
    empty_seats: initialData?.empty_seats || 0,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchRooms();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await movieService.getMovies({ page: 0, size: 100 });
      setMovies(response.content);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getRooms({ page: 0, size: 100 });
      setRooms(response.content);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['movie_id', 'room_id', 'empty_seats'].includes(name) 
        ? parseInt(value) || 0 
        : ['price'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu suất chiếu');
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phim <span className="text-red-500">*</span>
          </label>
          <select
            name="movie_id"
            value={formData.movie_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn phim</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phòng chiếu <span className="text-red-500">*</span>
          </label>
          <select
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.room_name} {room.cinemas && `- ${room.cinemas.cinema_name}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giờ chiếu <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="show_time"
            value={formData.show_time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giờ kết thúc <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giá vé (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: 80000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số ghế trống <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="empty_seats"
            value={formData.empty_seats}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="VD: 100"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật suất chiếu' : 'Thêm suất chiếu')}
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
