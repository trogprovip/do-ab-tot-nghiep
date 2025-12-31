/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { CreateSlotForm, UpdateSlotForm } from '@/lib/services/slotService';
import { movieService } from '@/lib/services/movieService';
import { roomService } from '@/lib/services/roomService';

interface Movie {
  id: number;
  title: string;
  duration: number; // Thời lượng phim (phút)
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
  onSubmit: (data: any) => Promise<void>; // Dùng any để linh hoạt cho cả Create/Update
  isEditing?: boolean;
}

export default function SlotForm({ initialData, onSubmit, isEditing = false }: SlotFormProps) {
  
  // Helper 1: Convert giờ từ DB/API -> Input HTML (YYYY-MM-DDTHH:mm)
  // Giữ nguyên giờ địa phương, không bị lùi 7 tiếng
  const formatDateTimeForInput = (dateString: string | Date | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // Trừ offset để khi toISOString() nó ra đúng giờ địa phương hiển thị trên máy
    const offset = date.getTimezoneOffset() * 60000; 
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState<any>({
    movie_id: initialData?.movie_id || 0,
    room_id: initialData?.room_id || 0,
    show_time: formatDateTimeForInput(initialData?.show_time),
    end_time: formatDateTimeForInput(initialData?.end_time),
    price: initialData?.price || 0,
    empty_seats: initialData?.empty_seats || 0,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load danh sách Phim và Phòng
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, roomsRes] = await Promise.all([
          movieService.getMovies({ page: 0, size: 100 }),
          roomService.getRooms({ page: 0, size: 100 })
        ]);
        setMovies(moviesRes.content);
        setRooms(roomsRes.content);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải danh sách phim hoặc phòng.');
      }
    };
    fetchData();
  }, []);

  // Tự động tính giờ kết thúc dựa trên duration của phim
  useEffect(() => {
    if (!formData.movie_id || !formData.show_time) return;

    const selectedMovie = movies.find(m => m.id === Number(formData.movie_id));
    if (selectedMovie && selectedMovie.duration) {
      const startTime = new Date(formData.show_time);
      if (!isNaN(startTime.getTime())) {
        const endTime = new Date(startTime.getTime() + selectedMovie.duration * 60000);
        // Chuyển về string input local để hiển thị vào ô End Time
        const offset = endTime.getTimezoneOffset() * 60000;
        const endTimeString = (new Date(endTime.getTime() - offset)).toISOString().slice(0, 16);

        setFormData((prev: any) => {
           if (prev.end_time === endTimeString) return prev;
           return { ...prev, end_time: endTimeString };
        });
      }
    }
  }, [formData.movie_id, formData.show_time, movies]);

  // Sync dữ liệu khi bấm Edit (đảm bảo load đúng data cũ)
  useEffect(() => {
    if (initialData) {
      setFormData({
        movie_id: initialData.movie_id || 0,
        room_id: initialData.room_id || 0,
        show_time: formatDateTimeForInput(initialData.show_time),
        end_time: formatDateTimeForInput(initialData.end_time),
        price: initialData.price || 0,
        empty_seats: initialData.empty_seats || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value // Lưu tạm dưới dạng string, lúc submit mới parse
    }));
  };

  // --- PHẦN QUAN TRỌNG NHẤT: HANDLE SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate cơ bản
    if (!formData.show_time || !formData.end_time || !formData.movie_id || !formData.room_id) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      setLoading(false);
      return;
    }

    try {
      // Helper: Format chuỗi giờ gửi lên Server (Fix lỗi 400)
      // Input: "2025-01-11T20:30" (16 ký tự) -> Output: "2025-01-11T20:30:00"
      const formatTimeForServer = (timeStr: string) => {
        if (!timeStr) return null;
        if (timeStr.length === 16) return `${timeStr}:00`; // Thêm giây
        return timeStr;
      };

      const submitData = {
        movie_id: Number(formData.movie_id),
        room_id: Number(formData.room_id),
        price: Number(formData.price),
        empty_seats: Number(formData.empty_seats),
        // Format đúng chuẩn Backend yêu cầu (yyyy-MM-dd'T'HH:mm:ss)
        show_time: formatTimeForServer(formData.show_time),
        end_time: formatTimeForServer(formData.end_time),
      };

      console.log('Data sending to server:', submitData); 
      await onSubmit(submitData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phim <span className="text-red-500">*</span></label>
          <select name="movie_id" value={formData.movie_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="0">Chọn phim</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>{movie.title} - {movie.duration} phút</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phòng chiếu <span className="text-red-500">*</span></label>
          <select name="room_id" value={formData.room_id} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="0">Chọn phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.room_name} {room.cinemas?.cinema_name && `- ${room.cinemas.cinema_name}`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ chiếu <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="show_time" value={formData.show_time || ''} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giờ kết thúc <span className="text-gray-400 text-xs">(Auto)</span> <span className="text-red-500">*</span></label>
          <input type="datetime-local" name="end_time" value={formData.end_time || ''} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giá vé (VNĐ) <span className="text-red-500">*</span></label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="1000" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số ghế trống <span className="text-red-500">*</span></label>
          <input type="number" name="empty_seats" value={formData.empty_seats} onChange={handleChange} required min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium shadow-sm">
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
        </button>
        <button type="button" onClick={() => window.history.back()} className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-300">
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}