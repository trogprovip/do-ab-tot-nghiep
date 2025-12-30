'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ticketService, Ticket } from '@/lib/services/ticketService';

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [searchTerm]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets({
        page: 0,
        size: 100,
        search: searchTerm || undefined,
      });
      setTickets(response.content);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: Ticket) => {
    router.push(`/admin/tickets/edit/${row.id}`);
  };

  const handleDelete = async (row: Ticket) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vé này?')) {
      return;
    }

    try {
      await ticketService.deleteTicket(row.id);
      alert('Xóa vé thành công!');
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Có lỗi xảy ra khi xóa vé!');
    }
  };

  const statusMap: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    cancelled: 'Đã hủy',
    used: 'Đã sử dụng',
  };

  const paymentStatusMap: Record<string, string> = {
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
    refunded: 'Đã hoàn tiền',
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'tickets_code', label: 'Mã vé' },
    { 
      key: 'accounts', 
      label: 'Khách hàng',
      render: (value: { full_name: string; email: string } | undefined) => 
        value ? `${value.full_name} (${value.email})` : '-'
    },
    { 
      key: 'slots', 
      label: 'Suất chiếu',
      render: (value: { show_time: string; movies?: { title: string }; rooms?: { room_name: string } } | undefined) => {
        if (!value) return '-';
        const movieTitle = value.movies?.title || 'N/A';
        const roomName = value.rooms?.room_name || 'N/A';
        const showTime = new Date(value.show_time).toLocaleString('vi-VN');
        return `${movieTitle} - ${roomName} (${showTime})`;
      }
    },
    { 
      key: 'final_amount', 
      label: 'Tổng tiền',
      render: (value: number) => `${Number(value).toLocaleString('vi-VN')} đ`
    },
    { 
      key: 'payment_status', 
      label: 'Thanh toán',
      render: (value: string) => paymentStatusMap[value] || value
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => statusMap[value] || value
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Vé</h1>
        <Link href="/admin/tickets/create">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm vé
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vé (mã vé, tên khách hàng, email)..."
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
          data={tickets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
