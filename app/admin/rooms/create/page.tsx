'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RoomForm from '@/components/RoomForm';
import { roomService, CreateRoomForm } from '@/lib/services/roomService';

export default function CreateRoomPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateRoomForm) => {
    try {
      await roomService.createRoom(data);
      alert('Thêm phòng chiếu thành công!');
      router.push('/admin/rooms');
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error('Có lỗi xảy ra khi thêm phòng chiếu');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thêm phòng chiếu mới</h1>
        <p className="text-gray-600 mt-2">Điền thông tin để thêm phòng chiếu mới vào hệ thống</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <RoomForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
