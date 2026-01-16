/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import Pagination from './ui/Pagination';

interface Column {
  key: string;
  label: string;
  width?: string; // Thêm width option
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable({ columns, data, onEdit, onDelete, onView, pagination }: DataTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 whitespace-nowrap">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      style={{ width: column.width }}
                      className="px-4 py-4 text-sm text-gray-900"
                    >
                      <div className="break-words">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <td className="w-32 px-4 py-4 text-center text-sm font-medium sticky right-0 bg-white">
                      <div className="flex items-center justify-center gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(row)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          size={pagination.size}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}