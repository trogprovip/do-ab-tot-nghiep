'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search, Edit, Save, X, Trash2 } from 'lucide-react';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  create_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingRole, setEditingRole] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 5
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.size.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
      });
      
      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();
      setUsers(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleEditRole = (userId: number, currentRole: string) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingRole('');
  };

  const handleSaveRole = async (userId: number) => {
    try {
      console.log('Updating user:', userId, 'with role:', editingRole);
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: editingRole }),
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      // Kiểm tra xem response có phải JSON không
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Response is not JSON:', text.substring(0, 200));
        alert('Lỗi: Server không trả về JSON. Có thể endpoint không tồn tại hoặc có lỗi server.');
        return;
      }

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: editingRole } : user
        ));
        setEditingUserId(null);
        setEditingRole('');
        alert('Cập nhật vai trò thành công!');
      } else {
        alert(`Lỗi: ${responseData.message || 'Có lỗi xảy ra khi cập nhật vai trò'}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Có lỗi xảy ra khi cập nhật vai trò: ' + error);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) {
      return;
    }

    setDeletingUserId(userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        alert('Xóa tài khoản thành công!');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi xóa tài khoản');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Có lỗi xảy ra khi xóa tài khoản');
    } finally {
      setDeletingUserId(null);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '60px' },
    { key: 'username', label: 'Tên đăng nhập', width: '150px' },
    { key: 'full_name', label: 'Họ và tên', width: '180px' },
    { key: 'email', label: 'Email', width: '220px' },
    { key: 'phone', label: 'Số điện thoại', width: '130px' },
    { 
      key: 'role', 
      label: 'Vai trò',
      width: '180px',
      render: (value: string, row: User) => {
        const roleMap: Record<string, { label: string; class: string }> = {
          admin: { label: 'Quản trị viên', class: 'bg-purple-100 text-purple-800' },
          user: { label: 'Người dùng', class: 'bg-blue-100 text-blue-800' },
        };

        if (editingUserId === row.id) {
          return (
            <select
              value={editingRole}
              onChange={(e) => setEditingRole(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          );
        }

        const role = roleMap[value] || { label: value, class: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.class}`}>
            {role.label}
          </span>
        );
      }
    },
    { 
      key: 'create_at', 
      label: 'Ngày tạo',
      width: '120px',
      render: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '150px',
      render: (_value: string, row: User) => (
        <div className="flex items-center gap-2">
          {editingUserId === row.id ? (
            <>
              <button
                onClick={() => handleSaveRole(row.id)}
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
                onClick={() => handleEditRole(row.id, row.role)}
                className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                title="Chỉnh sửa vai trò"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteUser(row.id, row.username)}
                disabled={deletingUserId === row.id}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa tài khoản"
              >
                {deletingUserId === row.id ? (
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
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