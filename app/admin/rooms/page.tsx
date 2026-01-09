'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { roomService, Room } from '@/lib/services/roomService';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchRooms();
  }, [searchTerm, pagination.currentPage]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms({
        page: pagination.currentPage,
        size: pagination.size,
        search: searchTerm || undefined,
      });
      setRooms(response.content);
      setPagination(prev => ({
        ...prev,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleEdit = (row: Room) => {
    router.push(`/admin/rooms/edit/${row.id}`);
  };

  const handleDelete = async (row: Room) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
      return;
    }

    try {
      await roomService.deleteRoom(row.id);
      alert('Xóa phòng chiếu thành công!');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Có lỗi xảy ra khi xóa phòng chiếu!');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'room_name', 
      label: 'Tên phòng',
      render: (value: string, row: Room) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.cinemas && (
            <div className="text-xs text-gray-500">
              {row.cinemas.cinema_name}
              {row.cinemas.provinces && ` - ${row.cinemas.provinces.province_name}`}
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'room_type', 
      label: 'Loại phòng',
      render: (value: string | null) => value || '-'
    },
    { key: 'total_seats', label: 'Số ghế' },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          active: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
          inactive: { label: 'Không hoạt động', class: 'bg-gray-100 text-gray-800' },
        };
        const status = statusMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
            {status.label}
          </span>
        );
      }
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Phòng chiếu</h1>
        <Link href="/admin/rooms/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm phòng chiếu
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={rooms}
          onEdit={handleEdit}
          onDelete={handleDelete}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            size: pagination.size,
            onPageChange: handlePageChange
          }}
        />
      )}
    </div>
  );
}
