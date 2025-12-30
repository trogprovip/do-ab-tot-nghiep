'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SlotForm from '@/components/SlotForm';
import { slotService, UpdateSlotForm } from '@/lib/services/slotService';

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

  const fetchSlot = async () => {
    if (!slotId) return;
    try {
      const slot = await slotService.getSlotById(slotId);
      setInitialData({
        movie_id: slot.movie_id,
        room_id: slot.room_id || 0,
        show_time: new Date(slot.show_time).toISOString().slice(0, 16),
        end_time: new Date(slot.end_time).toISOString().slice(0, 16),
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

  const handleSubmit = async (data: UpdateSlotForm) => {
    if (!slotId) return;
    try {
      await slotService.updateSlot(slotId, data);
      alert('Cập nhật suất chiếu thành công!');
      router.push('/admin/slots');
    } catch (error) {
      console.error('Error updating slot:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật suất chiếu');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-8">Không tìm thấy suất chiếu</div>;
  }

  return (
    <div>
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
