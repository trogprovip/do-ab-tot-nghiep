/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SlotForm from '@/components/SlotForm';
import { slotService } from '@/lib/services/slotService';

interface UpdateSlotForm {
  movie_id: number;
  room_id: number;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
}

export default function EditSlotPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<UpdateSlotForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotId, setSlotId] = useState<number | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setSlotId(parseInt(resolvedParams.id));
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (slotId) {
      fetchSlot();
    }
  }, [slotId]);

  // Hàm helper để convert giờ DB -> Giờ input
  const formatForInput = (dateStr: string | Date) => {
    if (!dateStr) return '';
    
    try {
      let date: Date;
      
      if (typeof dateStr === 'string') {
        // Xử lý format "dd-MM-yyyy HH:mm:ss" hoặc "yyyy-MM-dd HH:mm:ss" từ backend
        if (dateStr.includes('-') && !dateStr.includes('T')) {
          const parts = dateStr.split(' ');
          const dateParts = parts[0].split('-');
          
          // Kiểm tra xem là dd-MM-yyyy hay yyyy-MM-dd
          if (dateParts[0].length === 4) {
            // yyyy-MM-dd HH:mm:ss
            const [year, month, day] = dateParts;
            const [hours, minutes] = parts[1].split(':');
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          } else {
            // dd-MM-yyyy HH:mm:ss
            const [day, month, year] = dateParts;
            const [hours, minutes] = parts[1].split(':');
            date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
          }
        } else {
          // ISO format
          date = new Date(dateStr);
        }
      } else {
        date = new Date(dateStr);
      }
      
      if (isNaN(date.getTime())) return '';
      
      // Chuyển sang format yyyy-MM-ddTHH:mm cho input
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const fetchSlot = async () => {
    if (!slotId) return;
    try {
      const slot = await slotService.getSlotById(slotId);
      
      // Load dữ liệu vào form
      setInitialData({
        movie_id: slot.movie_id,
        room_id: slot.room_id || 0,
        show_time: formatForInput(slot.show_time),
        end_time: formatForInput(slot.end_time),
        price: Number(slot.price),
        empty_seats: slot.empty_seats,
      });
    } catch (error) {
      console.error('Error fetching slot:', error);
      alert('Không thể tải thông tin suất chiếu');
      router.push('/admin/slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!slotId) return;
    try {
      // SlotForm đã xử lý format dữ liệu đầu ra rồi, ở đây chỉ cần gọi API
      await slotService.updateSlot(slotId, data);
      alert('Cập nhật suất chiếu thành công!');
      router.push('/admin/slots');
    } catch (error: any) {
      console.error('Error updating slot:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật suất chiếu';
      throw new Error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Không tìm thấy suất chiếu</p>
          <button 
            onClick={() => router.push('/admin/slots')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa suất chiếu</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin suất chiếu</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <SlotForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </div>
  );
}