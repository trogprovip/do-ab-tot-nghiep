'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoomForm from '@/components/RoomForm';
import { roomService, UpdateRoomForm } from '@/lib/services/roomService';

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState<UpdateRoomForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<number | null>(null);

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setRoomId(parseInt(resolvedParams.id));
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const fetchRoom = async () => {
    if (!roomId) return;
    try {
      const room = await roomService.getRoomById(roomId);
      setInitialData({
        cinema_id: room.cinema_id,
        room_name: room.room_name,
        room_type: room.room_type || '',
        total_seats: room.total_seats,
        status: room.status,
      });
    } catch (error) {
      console.error('Error fetching room:', error);
      alert('Không thể tải thông tin phòng chiếu');
      router.push('/admin/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateRoomForm) => {
    if (!roomId) return;
    try {
      await roomService.updateRoom(roomId, data);
      alert('Cập nhật phòng chiếu thành công!');
      router.push('/admin/rooms');
    } catch (error) {
      console.error('Error updating room:', error);
      throw new Error('Có lỗi xảy ra khi cập nhật phòng chiếu');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-8">Không tìm thấy phòng chiếu</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa phòng chiếu</h1>
        <p className="text-gray-600 mt-2">Cập nhật thông tin phòng chiếu</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <RoomForm 
          initialData={initialData} 
          onSubmit={handleSubmit} 
          isEditing={true} 
        />
      </div>
    </div>
  );
}
