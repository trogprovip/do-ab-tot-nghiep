'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search, Eye } from 'lucide-react';

interface Booking {
  id: number;
  booking_code: string;
  account_id: number;
  slot_id: number;
  seat_numbers: string;
  total_price: number;
  status: string;
  payment_method: string;
  created_at: string;
  accounts: {
    username: string;
    email: string;
  };
  slots: {
    movies: {
      title: string;
    };
    rooms: {
      room_name: string;
    };
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchBookings();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.size.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();
      setBookings(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleView = (booking: Booking) => {
    alert(`Chi tiết đặt vé:\nMã đặt vé: ${booking.booking_code}\nPhim: ${booking.slots.movies.title}\nPhòng: ${booking.slots.rooms.room_name}\nGhế: ${booking.seat_numbers}\nTổng tiền: ${booking.total_price.toLocaleString('vi-VN')} VNĐ`);
  };

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'booking_code', label: 'Mã đặt vé', width: '120px' },
    { 
      key: 'accounts', 
      label: 'Khách hàng', 
      width: '200px',
      render: (value: Booking['accounts']) => (
        <div>
          <div className="font-medium">{value.username}</div>
          <div className="text-sm text-gray-500">{value.email}</div>
        </div>
      )
    },
    { 
      key: 'slots', 
      label: 'Thông tin suất chiếu', 
      width: '250px',
      render: (value: Booking['slots']) => (
        <div>
          <div className="font-medium">{value.movies.title}</div>
          <div className="text-sm text-gray-500">Phòng: {value.rooms.room_name}</div>
        </div>
      )
    },
    { key: 'seat_numbers', label: 'Số ghế', width: '100px' },
    { 
      key: 'total_price', 
      label: 'Tổng tiền',
      width: '120px',
      render: (value: number) => `${value.toLocaleString('vi-VN')} VNĐ`
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '100px',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          pending: { label: 'Chờ thanh toán', class: 'bg-yellow-100 text-yellow-800' },
          paid: { label: 'Đã thanh toán', class: 'bg-green-100 text-green-800' },
          cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
        };
        const status = statusMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      key: 'payment_method', 
      label: 'Thanh toán',
      width: '100px',
      render: (value: string) => {
        const methodMap: Record<string, string> = {
          cash: 'Tiền mặt',
          card: 'Thẻ tín dụng',
          bank_transfer: 'Chuyển khoản',
          online: 'Thanh toán online',
        };
        return methodMap[value] || value;
      }
    },
    { 
      key: 'created_at', 
      label: 'Ngày đặt',
      width: '120px',
      render: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đặt vé</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đặt vé, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={bookings}
          onView={handleView}
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
