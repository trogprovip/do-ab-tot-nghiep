'use client';

import React, { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import { Search, Trash2, Star, MessageSquare, Check, X, Eye } from 'lucide-react';

interface Review {
  id: number;
  account_id: number;
  movie_id: number;
  rating: number;
  comment: string | null;
  status: string;
  create_at: string;
  update_at: string | null;
  accounts: {
    id: number;
    username: string;
    full_name: string;
    email: string;
  };
  movies: {
    id: number;
    title: string;
    poster_url: string | null;
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  const [processingReviewId, setProcessingReviewId] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  });

  useEffect(() => {
    fetchReviews();
  }, [searchTerm, ratingFilter, statusFilter, pagination.currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.size.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      
      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      setReviews(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalElements: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleApproveReview = async (reviewId: number) => {
    setProcessingReviewId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, status: 'approved' } : review
        ));
        alert('Phê duyệt đánh giá thành công!');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi phê duyệt');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Có lỗi xảy ra khi phê duyệt');
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleRejectReview = async (reviewId: number) => {
    setProcessingReviewId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, status: 'rejected' } : review
        ));
        alert('Từ chối đánh giá thành công!');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi từ chối');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Có lỗi xảy ra khi từ chối');
    } finally {
      setProcessingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId: number, movieTitle: string, username: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá của "${username}" cho phim "${movieTitle}"?`)) {
      return;
    }

    setDeletingReviewId(reviewId);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review.id !== reviewId));
        setPagination(prev => ({
          ...prev,
          totalElements: prev.totalElements - 1
        }));
        alert('Xóa đánh giá thành công!');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi xóa đánh giá');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleViewDetail = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID', 
      width: '60px' 
    },
    { 
      key: 'movies', 
      label: 'Phim',
      width: '250px',
      render: (_value: unknown, row: Review) => (
        <div className="flex items-center gap-3">
          {row.movies.poster_url && (
            <img 
              src={row.movies.poster_url} 
              alt={row.movies.title}
              className="w-12 h-16 object-cover rounded"
            />
          )}
          <span className="font-medium text-gray-900">{row.movies.title}</span>
        </div>
      )
    },
    { 
      key: 'accounts', 
      label: 'Người dùng',
      width: '180px',
      render: (_value: unknown, row: Review) => (
        <div>
          <div className="font-medium text-gray-900">{row.accounts.full_name}</div>
          <div className="text-sm text-gray-500">@{row.accounts.username}</div>
        </div>
      )
    },
    { 
      key: 'rating', 
      label: 'Đánh giá',
      width: '150px',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          {renderStars(value)}
          <span className="text-sm font-semibold text-gray-700">{value}/5</span>
        </div>
      )
    },
    { 
      key: 'comment', 
      label: 'Bình luận',
      width: '300px',
      render: (value: string | null) => (
        <div className="max-w-xs">
          {value ? (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
            </div>
          ) : (
            <span className="text-gray-400 text-sm italic">Không có bình luận</span>
          )}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      width: '120px',
      render: (value: string) => {
        const statusMap: Record<string, { label: string; class: string }> = {
          pending: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
          approved: { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
          rejected: { label: 'Từ chối', class: 'bg-red-100 text-red-800' },
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
      key: 'create_at', 
      label: 'Ngày tạo',
      width: '120px',
      render: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '-'
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '220px',
      render: (_value: unknown, row: Review) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetail(row)}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveReview(row.id)}
                disabled={processingReviewId === row.id}
                className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Phê duyệt"
              >
                {processingReviewId === row.id ? (
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleRejectReview(row.id)}
                disabled={processingReviewId === row.id}
                className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Từ chối"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleDeleteReview(row.id, row.movies.title, row.accounts.username)}
            disabled={deletingReviewId === row.id}
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xóa đánh giá"
          >
            {deletingReviewId === row.id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      )
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Đánh giá</h1>
        <p className="text-gray-600 mt-2">Quản lý đánh giá và bình luận của người dùng về phim</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên phim, người dùng, bình luận..."
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
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả đánh giá</option>
            <option value="5">⭐ 5 sao</option>
            <option value="4">⭐ 4 sao</option>
            <option value="3">⭐ 3 sao</option>
            <option value="2">⭐ 2 sao</option>
            <option value="1">⭐ 1 sao</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Tổng đánh giá</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{pagination.totalElements}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Đánh giá 5 sao</div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">
              {reviews.filter(r => r.rating === 5).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Đánh giá 3-4 sao</div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {reviews.filter(r => r.rating <= 4).length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Đánh giá 1-2 sao</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {reviews.filter(r => r.rating <= 2).length}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <DataTable
          columns={columns}
          data={reviews}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalElements: pagination.totalElements,
            size: pagination.size,
            onPageChange: handlePageChange
          }}
        />
      )}
      
      {/* Modal Xem Chi Tiết Đánh Giá */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Đánh Giá</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Thông tin phim */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedReview.movies.poster_url && (
                    <img 
                      src={selectedReview.movies.poster_url} 
                      alt={selectedReview.movies.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedReview.movies.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedReview.rating)}
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedReview.rating}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thông tin người dùng */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Thông tin người đánh giá</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Họ tên:</span>
                      <span className="ml-2 text-gray-900">{selectedReview.accounts.full_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Username:</span>
                      <span className="ml-2 text-gray-900">@{selectedReview.accounts.username}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{selectedReview.accounts.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>
                      <span className="ml-2 text-gray-900">#{selectedReview.accounts.id}</span>
                    </div>
                  </div>
                </div>

                {/* Nội dung đánh giá */}
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Nội dung đánh giá</h4>
                  {selectedReview.comment ? (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Không có bình luận</p>
                  )}
                </div>

                {/* Thông tin hệ thống */}
                <div className="p-4 bg-gray-100 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Thông tin hệ thống</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID đánh giá:</span>
                      <span className="ml-2 text-gray-900">#{selectedReview.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Trạng thái:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedReview.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedReview.status === 'approved' ? 'Đã duyệt' :
                         selectedReview.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Ngày tạo:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(selectedReview.create_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Cập nhật:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedReview.update_at 
                          ? new Date(selectedReview.update_at).toLocaleString('vi-VN')
                          : 'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Các hành động */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedReview.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveReview(selectedReview.id);
                          setShowDetailModal(false);
                        }}
                        disabled={processingReviewId === selectedReview.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingReviewId === selectedReview.id ? 'Đang xử lý...' : 'Phê duyệt'}
                      </button>
                      <button
                        onClick={() => {
                          handleRejectReview(selectedReview.id);
                          setShowDetailModal(false);
                        }}
                        disabled={processingReviewId === selectedReview.id}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingReviewId === selectedReview.id ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteReview(selectedReview.id, selectedReview.movies.title, selectedReview.accounts.username);
                      setShowDetailModal(false);
                    }}
                    disabled={deletingReviewId === selectedReview.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingReviewId === selectedReview.id ? 'Đang xóa...' : 'Xóa đánh giá'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
