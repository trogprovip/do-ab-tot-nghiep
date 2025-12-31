/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import { movieService, Movie } from '@/lib/services/movieService';
import axios from 'axios';
import { 
  CalendarOutlined, 
  EnvironmentOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleFilled,
  StarFilled
} from '@ant-design/icons';
import { Spin, message } from 'antd';
import Link from 'next/link';

interface Cinema {
  id: number;
  cinema_name: string;
  address: string;
  provinces: {
    province_name: string;
  };
}

interface Room {
  id: number;
  room_name: string;
  total_seats: number;
}

interface Slot {
  id: number;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
  rooms: Room;
}

interface Seat {
  id: number;
  seat_row: string;
  seat_number: number;
  seat_type_id: number;
  status: string;
  seattypes: {
    type_name: string;
    price_multiplier: number;
  };
}

function BookingContent() {
  const searchParams = useSearchParams();
  const movieIdParam = searchParams?.get('movie');

  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  
  const [selectedMovie, setSelectedMovie] = useState<number | null>(movieIdParam ? parseInt(movieIdParam) : null);
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Chọn phim/rạp/suất, 2: Chọn ghế, 3: Thanh toán

  useEffect(() => {
    fetchMovies();
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedMovie && selectedCinema) {
      fetchSlots();
    }
  }, [selectedMovie, selectedCinema]);

  useEffect(() => {
    if (selectedSlot) {
      fetchSeats();
    }
  }, [selectedSlot]);

  const fetchMovies = async () => {
    try {
      const response = await movieService.getMovies({ status: 'now_showing', size: 100 });
      setMovies(response.content);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchCinemas = async () => {
    try {
      const response = await axios.get('/api/cinemas?size=100');
      setCinemas(response.data.content || []);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/slots?movie_id=${selectedMovie}&cinema_id=${selectedCinema}&size=100`);
      setSlots(response.data.content || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    if (!selectedSlot) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/seats?room_id=${selectedSlot.rooms.id}`);
      setSeats(response.data.data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'broken') return;
    
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 ghế!');
      return;
    }

    message.success('Đặt vé thành công! (Demo - Chưa kết nối thanh toán)');
  };

  const getSeatColor = (seat: Seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) return 'bg-green-500 border-green-600';
    if (seat.status === 'broken') return 'bg-gray-300 cursor-not-allowed';
    
    const name = seat.seattypes.type_name.toLowerCase();
    if (name.includes('vip')) return 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500';
    if (name.includes('couple') || name.includes('đôi')) return 'bg-pink-400 hover:bg-pink-500 border-pink-500';
    return 'bg-blue-400 hover:bg-blue-500 border-blue-500';
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

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => {
      const basePrice = selectedSlot?.price || 0;
      const multiplier = seat.seattypes.price_multiplier || 1;
      return total + (basePrice * multiplier);
    }, 0);
  };

  const selectedMovieData = movies.find(m => m.id === selectedMovie);
  const selectedCinemaData = cinemas.find(c => c.id === selectedCinema);

  // Group slots by date
  const slotsByDate: { [key: string]: Slot[] } = {};
  slots.forEach(slot => {
    const date = new Date(slot.show_time).toLocaleDateString('vi-VN');
    if (!slotsByDate[date]) {
      slotsByDate[date] = [];
    }
    slotsByDate[date].push(slot);
  });

  const seatsByRow = groupSeatsByRow();
  const sortedRows = Object.keys(seatsByRow).sort();

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0] py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-2">
              ĐẶT VÉ XEM PHIM
            </h1>
            <p className="text-gray-600 font-medium">Chọn phim, rạp và suất chiếu yêu thích của bạn</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <span className="text-xl">1</span>
                <span>Chọn suất</span>
              </div>
              <div className="w-12 h-1 bg-gray-300"></div>
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <span className="text-xl">2</span>
                <span>Chọn ghế</span>
              </div>
              <div className="w-12 h-1 bg-gray-300"></div>
              <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <span className="text-xl">3</span>
                <span>Thanh toán</span>
              </div>
            </div>
          </div>

          {/* Step 1: Select Movie, Cinema, Showtime */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Select Movie */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-3xl">🎬</span>
                  CHỌN PHIM
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {movies.map(movie => (
                    <div
                      key={movie.id}
                      onClick={() => setSelectedMovie(movie.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedMovie === movie.id
                          ? 'bg-red-50 border-red-600 shadow-lg'
                          : 'bg-gray-50 border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {movie.poster_url && (
                          <img src={movie.poster_url} alt={movie.title} className="w-16 h-24 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{movie.title}</h4>
                          <p className="text-sm text-gray-500">{movie.duration} phút</p>
                          {movie.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <StarFilled className="text-yellow-500 text-xs" />
                              <span className="text-sm font-bold text-gray-700">{movie.rating}/10</span>
                            </div>
                          )}
                        </div>
                        {selectedMovie === movie.id && (
                          <CheckCircleFilled className="text-2xl text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Cinema */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <EnvironmentOutlined className="text-3xl text-red-600" />
                  CHỌN RẠP
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cinemas.map(cinema => (
                    <div
                      key={cinema.id}
                      onClick={() => setSelectedCinema(cinema.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedCinema === cinema.id
                          ? 'bg-red-50 border-red-600 shadow-lg'
                          : 'bg-gray-50 border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{cinema.cinema_name}</h4>
                          <p className="text-sm text-gray-500">{cinema.provinces.province_name}</p>
                          <p className="text-xs text-gray-400 mt-1">{cinema.address}</p>
                        </div>
                        {selectedCinema === cinema.id && (
                          <CheckCircleFilled className="text-2xl text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Showtime */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <ClockCircleOutlined className="text-3xl text-red-600" />
                  CHỌN SUẤT CHIẾU
                </h3>
                
                {!selectedMovie || !selectedCinema ? (
                  <div className="text-center py-12 text-gray-400">
                    <CalendarOutlined className="text-5xl mb-3" />
                    <p className="font-medium">Vui lòng chọn phim và rạp</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12">
                    <Spin size="large" />
                  </div>
                ) : Object.keys(slotsByDate).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="font-medium">Không có suất chiếu</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                      <div key={date}>
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <CalendarOutlined />
                          {date}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {dateSlots.map(slot => {
                            const showTime = new Date(slot.show_time);
                            const hours = String(showTime.getHours()).padStart(2, '0');
                            const minutes = String(showTime.getMinutes()).padStart(2, '0');
                            
                            return (
                              <button
                                key={slot.id}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setStep(2);
                                }}
                                className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                              >
                                <div className="text-lg">{hours}:{minutes}</div>
                                <div className="text-xs opacity-90">{slot.empty_seats} ghế trống</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Seats */}
          {step === 2 && selectedSlot && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">CHỌN GHẾ NGỒI</h3>
                    <p className="text-gray-600">
                      {selectedMovieData?.title} - {selectedCinemaData?.cinema_name} - {selectedSlot.rooms.room_name}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300"
                  >
                    ← Quay lại
                  </button>
                </div>

                {/* Screen */}
                <div className="mb-8 text-center">
                  <div className="inline-block bg-gradient-to-b from-gray-800 to-gray-600 text-white px-12 py-3 rounded-t-2xl font-black text-lg shadow-xl">
                    MÀN HÌNH
                  </div>
                </div>

                {/* Seats */}
                {loading ? (
                  <div className="text-center py-12">
                    <Spin size="large" />
                  </div>
                ) : (
                  <div className="space-y-3 mb-8">
                    {sortedRows.map((row) => (
                      <div key={row} className="flex items-center gap-3 justify-center">
                        <div className="w-8 text-center font-black text-gray-700">{row}</div>
                        <div className="flex gap-2">
                          {seatsByRow[row]
                            .sort((a, b) => a.seat_number - b.seat_number)
                            .map((seat) => (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.status === 'broken'}
                                className={`w-12 h-12 rounded-lg ${getSeatColor(seat)} border-2 transition-all flex items-center justify-center text-white text-sm font-bold shadow-md hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100`}
                              >
                                {seat.seat_number}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 flex-wrap pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-blue-400 border-2 border-blue-500"></div>
                    <span className="text-sm font-medium">Thường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-yellow-400 border-2 border-yellow-500"></div>
                    <span className="text-sm font-medium">VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-pink-400 border-2 border-pink-500"></div>
                    <span className="text-sm font-medium">Couple</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-green-500 border-2 border-green-600"></div>
                    <span className="text-sm font-medium">Đã chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gray-300"></div>
                    <span className="text-sm font-medium">Hỏng</span>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-black mb-6">THÔNG TIN ĐẶT VÉ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Phim</p>
                    <p className="font-bold text-lg">{selectedMovieData?.title}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">Rạp</p>
                    <p className="font-bold text-lg">{selectedCinemaData?.cinema_name}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">Suất chiếu</p>
                    <p className="font-bold text-lg">
                      {new Date(selectedSlot.show_time).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">Phòng</p>
                    <p className="font-bold text-lg">{selectedSlot.rooms.room_name}</p>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg">Ghế đã chọn:</span>
                    <span className="font-black text-xl">
                      {selectedSeats.length > 0 
                        ? selectedSeats.map(s => `${s.seat_row}${s.seat_number}`).join(', ')
                        : 'Chưa chọn ghế'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black">TỔNG TIỀN:</span>
                    <span className="text-4xl font-black">
                      {calculateTotal().toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={selectedSeats.length === 0}
                    className="w-full py-4 bg-white text-red-600 rounded-full font-black text-xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                  >
                    <ShoppingCartOutlined className="text-2xl" />
                    THANH TOÁN NGAY
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CGVFooter />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
