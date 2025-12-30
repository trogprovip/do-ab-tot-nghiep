'use client';

import React, { useState, useEffect } from 'react';
import { Armchair, Plus, Edit2, Trash2, Grid3x3, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface SeatType {
  id: number;
  type_name: string;
  price_multiplier: number;
  description: string | null;
}

interface Room {
  id: number;
  room_name: string;
  total_seats: number;
  cinemas: {
    cinema_name: string;
  };
}

interface Seat {
  id: number;
  room_id: number;
  seat_row: string;
  seat_number: number;
  seat_type_id: number;
  status: string;
  seattypes: SeatType;
  rooms: Room;
}

export default function SeatsPage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seatTypes, setSeatTypes] = useState<SeatType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);

  const [bulkForm, setBulkForm] = useState({
    room_id: '',
    rows: 8,
    seatsPerRow: 12,
    seat_type_id: '',
  });

  const [editForm, setEditForm] = useState({
    seat_row: '',
    seat_number: 1,
    seat_type_id: '',
    status: 'active',
  });

  useEffect(() => {
    fetchRooms();
    fetchSeatTypes();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchSeats(selectedRoom);
    }
  }, [selectedRoom]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms?size=100');
      if (response.data.content) {
        setRooms(response.data.content);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchSeatTypes = async () => {
    try {
      const response = await axios.get('/api/seat-types');
      if (response.data.success) {
        setSeatTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
    }
  };

  const fetchSeats = async (roomId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/seats?room_id=${roomId}`);
      if (response.data.success) {
        setSeats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Tạo ghế hàng loạt sẽ xóa tất cả ghế cũ. Bạn có chắc chắn?')) return;

    try {
      await axios.post('/api/seats/bulk', bulkForm);
      alert('Tạo ghế hàng loạt thành công!');
      setShowBulkModal(false);
      if (selectedRoom) {
        fetchSeats(selectedRoom);
      }
    } catch (error) {
      console.error('Error creating bulk seats:', error);
      alert('Lỗi khi tạo ghế hàng loạt');
    }
  };

  const handleEditSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeat) return;

    try {
      await axios.put(`/api/seats/${editingSeat.id}`, editForm);
      alert('Cập nhật ghế thành công!');
      setShowEditModal(false);
      if (selectedRoom) {
        fetchSeats(selectedRoom);
      }
    } catch (error) {
      console.error('Error updating seat:', error);
      alert('Lỗi khi cập nhật ghế');
    }
  };

  const handleDeleteSeat = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ghế này?')) return;

    try {
      await axios.delete(`/api/seats/${id}`);
      alert('Xóa ghế thành công!');
      if (selectedRoom) {
        fetchSeats(selectedRoom);
      }
    } catch (error) {
      console.error('Error deleting seat:', error);
      alert('Lỗi khi xóa ghế');
    }
  };

  const openEditModal = (seat: Seat) => {
    setEditingSeat(seat);
    setEditForm({
      seat_row: seat.seat_row,
      seat_number: seat.seat_number,
      seat_type_id: seat.seat_type_id.toString(),
      status: seat.status,
    });
    setShowEditModal(true);
  };

  const getSeatColor = (seatType: string) => {
    const name = seatType.toLowerCase();
    if (name.includes('vip')) return 'bg-yellow-500';
    if (name.includes('couple') || name.includes('đôi')) return 'bg-pink-500';
    return 'bg-blue-500';
  };

  const groupSeatsByRow = () => {
    const grouped: { [key: string]: Seat[] } = {};
    seats.forEach((seat) => {
      if (!grouped[seat.seat_row]) {
        grouped[seat.seat_row] = [];
      }
      grouped[seat.seat_row].push(seat);
    });
    return grouped;
  };

  const seatsByRow = groupSeatsByRow();
  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Ghế</h1>
          <p className="text-gray-500 mt-1">Cấu hình sơ đồ ghế cho từng phòng chiếu</p>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          disabled={!selectedRoom}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Grid3x3 className="w-5 h-5" />
          Tạo Ghế Hàng Loạt
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Chọn Phòng Chiếu
        </label>
        <select
          value={selectedRoom || ''}
          onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        >
          <option value="">-- Chọn phòng chiếu --</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.cinemas.cinema_name} - {room.room_name} ({room.total_seats} ghế)
            </option>
          ))}
        </select>
      </div>

      {!selectedRoom && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Armchair className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chọn phòng chiếu</h3>
          <p className="text-gray-500">Vui lòng chọn phòng chiếu để xem và quản lý ghế</p>
        </div>
      )}

      {selectedRoom && loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {selectedRoom && !loading && seats.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có ghế nào</h3>
          <p className="text-gray-500 mb-6">Tạo ghế hàng loạt để bắt đầu</p>
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
          >
            <Grid3x3 className="w-5 h-5" />
            Tạo Ghế Hàng Loạt
          </button>
        </div>
      )}

      {selectedRoom && !loading && seats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6 text-center">
            <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-t-lg font-semibold">
              MÀN HÌNH
            </div>
          </div>

          <div className="space-y-3">
            {sortedRows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <div className="w-8 text-center font-bold text-gray-700">{row}</div>
                <div className="flex-1 flex gap-2 justify-center flex-wrap">
                  {seatsByRow[row]
                    .sort((a, b) => a.seat_number - b.seat_number)
                    .map((seat) => (
                      <div
                        key={seat.id}
                        className="group relative"
                        onClick={() => openEditModal(seat)}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${getSeatColor(
                            seat.seattypes.type_name
                          )} ${
                            seat.status === 'broken'
                              ? 'opacity-30 cursor-not-allowed'
                              : 'cursor-pointer hover:scale-110'
                          } transition-all flex items-center justify-center text-white text-xs font-bold shadow-md`}
                        >
                          {seat.seat_number}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {seat.seat_row}{seat.seat_number} - {seat.seattypes.type_name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {seatTypes.map((type) => (
                <div key={type.id} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded ${getSeatColor(type.type_name)}`}></div>
                  <span className="text-sm text-gray-700 font-medium">{type.type_name}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-300"></div>
                <span className="text-sm text-gray-700 font-medium">Hỏng</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Tạo Ghế Hàng Loạt</h2>
              <p className="text-sm text-red-600 mt-2">⚠️ Sẽ xóa tất cả ghế cũ trong phòng</p>
            </div>

            <form onSubmit={handleBulkCreate} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phòng Chiếu
                </label>
                <select
                  value={bulkForm.room_id}
                  onChange={(e) => setBulkForm({ ...bulkForm, room_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.cinemas.cinema_name} - {room.room_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số Hàng (A-Z)
                </label>
                <input
                  type="number"
                  min="1"
                  max="26"
                  value={bulkForm.rows}
                  onChange={(e) => setBulkForm({ ...bulkForm, rows: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số Ghế Mỗi Hàng
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={bulkForm.seatsPerRow}
                  onChange={(e) =>
                    setBulkForm({ ...bulkForm, seatsPerRow: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại Ghế Mặc Định
                </label>
                <select
                  value={bulkForm.seat_type_id}
                  onChange={(e) => setBulkForm({ ...bulkForm, seat_type_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                >
                  <option value="">-- Chọn loại ghế --</option>
                  {seatTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name} (x{type.price_multiplier})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tổng ghế:</strong> {bulkForm.rows * bulkForm.seatsPerRow} ghế
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
                >
                  Tạo Ghế
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingSeat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh Sửa Ghế {editingSeat.seat_row}{editingSeat.seat_number}
              </h2>
            </div>

            <form onSubmit={handleEditSeat} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loại Ghế
                </label>
                <select
                  value={editForm.seat_type_id}
                  onChange={(e) => setEditForm({ ...editForm, seat_type_id: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                >
                  {seatTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name} (x{type.price_multiplier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng Thái
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                >
                  <option value="active">Hoạt động</option>
                  <option value="broken">Hỏng</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteSeat(editingSeat.id)}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold"
                >
                  Xóa
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold"
                >
                  Cập Nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
