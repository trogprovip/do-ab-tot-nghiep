/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search, Save, X, Trash2 } from 'lucide-react';
import { ticketService, Ticket } from '@/lib/services/ticketService';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Khởi tạo state mặc định để tránh lỗi null/undefined
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  const [editingTicketId, setEditingTicketId] = useState<number | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<string>('');
  const [deletingTicketId, setDeletingTicketId] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [searchTerm, statusFilter, paymentStatusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Gọi API: Lưu ý kiểm tra xem hàm này trong ticketService trả về đúng cấu trúc { content: ... } không
      const response = await ticketService.getTickets({
        page: 0,
        size: 100,
        search: searchTerm || undefined,
      });
      // Nếu API trả về mảng trực tiếp thì dùng response, nếu trả về object phân trang thì dùng response.content
      setTickets(Array.isArray(response) ? response : response.content || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Không alert lỗi ở đây để tránh spam popup khi mới load trang
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (ticket: Ticket) => {
    setEditingTicketId(ticket.id);
    // Sửa lỗi logic: Lấy đúng trường status từ ticket
    setEditingStatus(ticket.status || 'pending'); 
    setEditingPaymentStatus(ticket.payment_status || 'unpaid');
  };

  const handleCancelEdit = () => {
    setEditingTicketId(null);
    setEditingStatus('');
    setEditingPaymentStatus('');
  };

  const handleSaveStatus = async (ticketId: number) => {
    try {
      // --- SỬA LỖI GẠCH ĐỎ ---
      // Ép kiểu (as any) để TypeScript không báo lỗi string khác với Union Type
      // Hoặc bạn cần sửa interface Ticket trong ticketService cho đúng
      await ticketService.updateTicket(ticketId, {
        status: editingStatus as any, 
        payment_status: editingPaymentStatus as any,
      });

      setTickets(prevTickets => prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: editingStatus as any, 
              payment_status: editingPaymentStatus as any 
            } 
          : ticket
      ));
      
      setEditingTicketId(null);
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Có lỗi xảy ra khi cập nhật. Vui lòng kiểm tra Console (F12).');
    }
  };

  const handleDelete = async (ticketId: number, ticketCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vé "${ticketCode}"?`)) {
      return;
    }

    setDeletingTicketId(ticketId);
    try {
      await ticketService.deleteTicket(ticketId);
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      alert('Xóa vé thành công!');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Có lỗi xảy ra khi xóa vé!');
    } finally {
      setDeletingTicketId(null);
    }
  };

  // Maps hiển thị tiếng Việt
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

  // Filter client-side (nếu API chưa hỗ trợ filter)
  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (paymentStatusFilter && ticket.payment_status !== paymentStatusFilter) return false;
    return true;
  });

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    // Kiểm tra kỹ tên trường này khớp với API trả về (ticket_code hay tickets_code?)
    { key: 'tickets_code', label: 'Mã vé', width: '120px' }, 
    { 
      key: 'accounts', 
      label: 'Khách hàng',
      width: '200px',
      render: (value: any) => 
        value ? `${value.full_name || value.username} (${value.email})` : '-'
    },
    { 
      key: 'slots', 
      label: 'Suất chiếu',
      width: '280px',
      render: (value: any) => {
        if (!value) return '-';
        const movieTitle = value.movies?.title || 'N/A';
        const roomName = value.rooms?.room_name || 'N/A';
        
        // Format giờ chiếu đúng múi giờ
        let showTime = 'N/A';
        if (value.show_time) {
          const date = new Date(value.show_time);
          if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            showTime = `${hours}:${minutes} ${day}/${month}/${year}`;
          }
        }
        
        // Format giá vé
        const price = value.price ? Number(value.price).toLocaleString('vi-VN') : '0';
        
        return (
          <div>
            <div className="font-medium">{movieTitle}</div>
            <div className="text-xs text-gray-500">{roomName} - {showTime}</div>
            <div className="text-xs text-blue-600 font-semibold">{price} đ</div>
          </div>
        );
      }
    },
    { 
      key: 'final_amount', 
      label: 'Tổng tiền',
      width: '120px',
      render: (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`
    },
    { 
      key: 'payment_status', 
      label: 'Thanh toán',
      width: '150px',
      render: (value: string, row: Ticket) => {
        if (editingTicketId === row.id) {
          return (
            <select
              value={editingPaymentStatus}
              onChange={(e) => setEditingPaymentStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          );
        }
        const statusColors: Record<string, string> = {
          paid: 'bg-green-100 text-green-800',
          unpaid: 'bg-yellow-100 text-yellow-800',
          refunded: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {paymentStatusMap[value] || value}
          </span>
        );
      }
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '150px',
      render: (value: string, row: Ticket) => {
        if (editingTicketId === row.id) {
          return (
            <select
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="used">Đã sử dụng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          );
        }
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          used: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {statusMap[value] || value}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '120px',
      render: (_value: string, row: Ticket) => (
        <div className="flex items-center gap-2">
          {editingTicketId === row.id ? (
            <>
              <button
                onClick={() => handleSaveStatus(row.id)}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                title="Lưu"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                title="Hủy"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEditStatus(row)}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                title="Sửa"
              >
                Sửa
              </button>
              <button
                onClick={() => handleDelete(row.id, row.tickets_code)}
                disabled={deletingTicketId === row.id}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                title="Xóa"
              >
                {deletingTicketId === row.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Vé</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vé..."
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
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="used">Đã sử dụng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredTickets}
        />
      )}
    </div>
  );
}