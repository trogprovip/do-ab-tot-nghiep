/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SlotForm from '@/components/SlotForm';
import { slotService } from '@/lib/services/slotService'; // Bỏ CreateSlotForm ở import nếu không dùng

export default function CreateSlotPage() {
  const router = useRouter();

  // SỬA Ở ĐÂY: Đổi (data: CreateSlotForm) thành (data: any)
  // Việc này giúp TypeScript không báo lỗi dòng onSubmit bên dưới nữa
  const handleSubmit = async (data: any) => {
    try {
      await slotService.createSlot(data);
      
      alert('Thêm suất chiếu thành công!');
      router.push('/admin/slots');
    } catch (error: any) {
      console.error('Error creating slot:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm suất chiếu';
      throw new Error(errorMessage);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm suất chiếu mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm suất chiếu mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Bây giờ dòng này sẽ hết báo đỏ */}
        <SlotForm onSubmit={handleSubmit} isEditing={false} />
      </div>
    </div>
  );
}