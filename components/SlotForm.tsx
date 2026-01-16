/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { movieService } from '@/lib/services/movieService';
import { roomService } from '@/lib/services/roomService';
import { DatePicker, TimePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import AntdProvider from './AntdProvider';

interface Movie {
  id: number;
  title: string;
  duration: number; 
}

interface Room {
  id: number;
  room_name: string;
  cinemas?: {
    cinema_name: string;
  };
}

interface SlotFormProps {
  initialData?: any; 
  onSubmit: (data: any) => Promise<void>;
  isEditing?: boolean;
}

export default function SlotForm({ initialData, onSubmit, isEditing = false }: SlotFormProps) {
  
  // Helper function to convert backend datetime string to dayjs object
  const formatDateTimeToDayjs = (dateString: string | undefined) => {
    if (!dateString) return null;
    try {
      let date: Date;
      
      if (typeof dateString === 'string') {
        if (dateString.includes('-') && !dateString.includes('T')) {
          const parts = dateString.split(' ');
          const dateParts = parts[0].split('-');
          const timeParts = parts[1]?.split(':') || ['00', '00', '00'];
          
          if (dateParts[0].length === 4) {
            const [year, month, day] = dateParts;
            const [hours, minutes] = timeParts;
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          } else {
            const [day, month, year] = dateParts;
            const [hours, minutes] = timeParts;
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          }
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return null;
      return dayjs(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };

  const [formData, setFormData] = useState<any>({
    movie_id: initialData?.movie_id || 0,
    room_id: initialData?.room_id || 0,
    show_date: formatDateTimeToDayjs(initialData?.show_time),
    show_time: formatDateTimeToDayjs(initialData?.show_time),
    end_date: formatDateTimeToDayjs(initialData?.end_time),
    end_time: formatDateTimeToDayjs(initialData?.end_time),
    price: initialData?.price || 0,
    empty_seats: initialData?.empty_seats || 0,
  });

  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError('Không thể tải danh sách phim hoặc phòng.');
      }
    };
    fetchData();
  }, []);

  // Sync dữ liệu khi Edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        movie_id: initialData.movies?.id || initialData.movie_id || 0,
        room_id: initialData.rooms?.id || initialData.room_id || 0,
        show_date: formatDateTimeToDayjs(initialData.show_time),
        show_time: formatDateTimeToDayjs(initialData.show_time),
        end_date: formatDateTimeToDayjs(initialData.end_time),
        end_time: formatDateTimeToDayjs(initialData.end_time),
        price: initialData.price || 0,
        empty_seats: initialData.empty_seats || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: string, date: Dayjs | null) => {
    setFormData((prev: any) => ({ ...prev, [field]: date }));
  };

  // 2. CHUYỂN dayjs objects -> yyyy-MM-dd HH:mm:ss (Gửi về Spring Boot)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // Validate that both date and time are selected for show time
    if (!formData.show_date || !formData.show_time) {
      setError('Vui lòng chọn đầy đủ ngày và giờ chiếu');
      return;
    }
    
    // Validate that both date and time are selected for end time
    if (!formData.end_date || !formData.end_time) {
      setError('Vui lòng chọn đầy đủ ngày và giờ kết thúc');
      return;
    }

    // Combine date and time for show time
    const showDateTime = formData.show_date
      .hour(formData.show_time.hour())
      .minute(formData.show_time.minute())
      .second(0);

    // Combine date and time for end time
    const endDateTime = formData.end_date
      .hour(formData.end_time.hour())
      .minute(formData.end_time.minute())
      .second(0);

    const submitData = {
      movieId: Number(formData.movie_id),
      roomId: Number(formData.room_id),
      showTime: showDateTime.format('YYYY-MM-DD HH:mm:ss'),
      endTime: endDateTime.format('YYYY-MM-DD HH:mm:ss'),
    };

    console.log('📤 Sending to backend:', submitData);

    await onSubmit(submitData);
  } catch (err: any) {
    setError(err.message || 'Có lỗi xảy ra');
  } finally {
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phim *</label>
          <select 
            name="movie_id" 
            value={formData.movie_id} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">Chọn phim</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>
                {movie.title} - {movie.duration} phút
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phòng chiếu *</label>
          <select 
            name="room_id" 
            value={formData.room_id} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">Chọn phòng</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>
                {room.room_name} {room.cinemas?.cinema_name && `- ${room.cinemas.cinema_name}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ngày chiếu *</label>
          <AntdProvider>
            <DatePicker
              value={formData.show_date}
              onChange={(date) => handleDateChange('show_date', date)}
              placeholder="Chọn ngày chiếu"
              format="DD/MM/YYYY"
              className="w-full"
              style={{ 
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                height: '40px'
              }}
            />
          </AntdProvider>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giờ chiếu *</label>
          <AntdProvider>
            <TimePicker
              value={formData.show_time}
              onChange={(time) => handleDateChange('show_time', time)}
              placeholder="Chọn giờ chiếu"
              format="HH:mm"
              className="w-full"
              style={{ 
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                height: '40px'
              }}
            />
          </AntdProvider>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ngày kết thúc *</label>
          <AntdProvider>
            <DatePicker
              value={formData.end_date}
              onChange={(date) => handleDateChange('end_date', date)}
              placeholder="Chọn ngày kết thúc"
              format="DD/MM/YYYY"
              className="w-full"
              style={{ 
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                height: '40px'
              }}
            />
          </AntdProvider>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Giờ kết thúc *</label>
          <AntdProvider>
            <TimePicker
              value={formData.end_time}
              onChange={(time) => handleDateChange('end_time', time)}
              placeholder="Chọn giờ kết thúc"
              format="HH:mm"
              className="w-full"
              style={{ 
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                height: '40px'
              }}
            />
          </AntdProvider>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Lưu ý:</strong> Giá vé và số ghế trống sẽ tự động được tính từ hệ thống dựa trên cấu hình giá và phòng chiếu đã chọn.
        </p>
      </div>

      <div className="flex gap-4 pt-4 border-t mt-6">
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
        </button>
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg border hover:bg-gray-200 transition-colors"
        >
          Hủy bỏ
        </button>
      </div>
    </form>
  );
}