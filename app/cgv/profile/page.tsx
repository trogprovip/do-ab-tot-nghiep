'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Avatar, Button, Tabs, Card } from 'antd';
import { 
  UserOutlined, 
  HistoryOutlined, 
  HeartOutlined, 
  SettingOutlined,
  CrownOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EditOutlined,
  TagOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';
import BackButton from '@/components/ui/BackButton';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  membership_tier: string;
  points: number;
  created_at: string;
}

interface BookingHistory {
  id: number;
  movie_title: string;
  cinema_name: string;
  showtime: string;
  seats: string;
  total_price: number;
  status: string;
  booking_date: string;
}

interface FavoriteMovie {
  id: number;
  title: string;
  poster_url: string;
  genre: string;
  duration: number;
  release_date: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Check URL parameter for tab selection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'bookings') {
        setActiveTab('bookings');
      }
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchBookingHistory();
    fetchFavoriteMovies();
  }, []);

  const fetchUserData = async () => {
    try {
      // Call API to get user data from database
      const response = await fetch('/api/users/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUser(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to mock data if API fails
      const mockUser: UserProfile = {
        id: 1,
        username: 'cgv_member',
        email: 'user@example.com',
        full_name: 'Nguyễn Văn A',
        phone: '0912345678',
        avatar_url: 'https://via.placeholder.com/150',
        membership_tier: 'GOLD',
        points: 2500,
        created_at: '2024-01-15'
      };
      setUser(mockUser);
    }
  };

  const fetchBookingHistory = async () => {
    try {
      // Call API to get booking history from database
      const response = await fetch('/api/users/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking history');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch booking history');
      }
    } catch (error) {
      console.error('Error fetching booking history:', error);
      // Fallback to empty array if API fails
      setBookings([]);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      // Call API to get favorite movies from database
      const response = await fetch('/api/users/favorites');
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorite movies');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFavorites(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch favorite movies');
      }
    } catch (error) {
      console.error('Error fetching favorite movies:', error);
      // Fallback to empty array if API fails
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM': return 'bg-gradient-to-r from-gray-700 to-gray-900';
      case 'GOLD': return 'bg-gradient-to-r from-yellow-500 to-amber-600';
      case 'SILVER': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Đã Xác Nhận';
      case 'CANCELLED': return 'Đã Hủy';
      case 'UPCOMING': return 'Sắp Chiếu';
      case 'PENDING': return 'Chờ xác nhận';
      default: return status;
    }
  };

  if (loading) {
    return (
      <>
        <CGVHeader />
        <div className="min-h-screen bg-[#fdfcf0] flex items-center justify-center">
          <Spin size="large" />
        </div>
        <CGVFooter />
      </>
    );
  }

  return (
    <>
      <CGVHeader />
      
      <div className="min-h-screen bg-[#fdfcf0]">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-6">
          <BackButton 
            onClick={() => window.history.back()}
            text="Quay lại trang chủ"
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar 
                  size={120} 
                  src={user?.avatar_url} 
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors">
                  <EditOutlined className="text-xs" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.full_name}</h1>
                <p className="text-gray-600 mb-4">@{user?.username}</p>
                
                {/* Membership Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold ${getMembershipColor(user?.membership_tier || '')} mb-4`}>
                  <CrownOutlined />
                  {user?.membership_tier} MEMBER
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MailOutlined />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <PhoneOutlined />
                    {user?.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined />
                    Tham gia: {new Date(user?.created_at || '').toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <TagOutlined />
                    {user?.points?.toLocaleString()} điểm
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link href="/cgv/profile/edit">
                  <Button type="primary" icon={<EditOutlined />} size="large" className="bg-red-600 hover:bg-red-700 w-full">
                    Chỉnh Sửa Hồ Sơ
                  </Button>
                </Link>
                <Button icon={<SettingOutlined />} size="large">
                  Cài Đặt
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs Content */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="profile-tabs"
            items={[
              {
                key: 'overview',
                label: (
                  <span className="flex items-center gap-2">
                    <UserOutlined />
                    Tổng Quan
                  </span>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">{bookings.length}</div>
                      <div className="text-gray-600">Lịch Đặt Vé</div>
                    </Card>
                    <Card className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">{favorites.length}</div>
                      <div className="text-gray-600">Phim Yêu Thích</div>
                    </Card>
                    <Card className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">{user?.points?.toLocaleString()}</div>
                      <div className="text-gray-600">Điểm Thưởng</div>
                    </Card>
                  </div>
                )
              },
              {
                key: 'bookings',
                label: (
                  <span className="flex items-center gap-2">
                    <HistoryOutlined />
                    Lịch Sử Đặt Vé
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{booking.movie_title}</h3>
                            <p className="text-gray-600">{booking.cinema_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.showtime).toLocaleString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-sm text-gray-500">Ghế: {booking.seats}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600 mb-2">
                              {booking.total_price.toLocaleString('vi-VN')}đ
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              },
              {
                key: 'favorites',
                label: (
                  <span className="flex items-center gap-2">
                    <HeartOutlined />
                    Phim Yêu Thích
                  </span>
                ),
                children: (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {favorites.map((movie) => (
                      <Link key={movie.id} href={`/cgv/movies/${movie.id}`}>
                        <div className="group cursor-pointer">
                          <div className="aspect-2/3 rounded-lg overflow-hidden mb-2">
                            <Image 
                              src={movie.poster_url} 
                              alt={movie.title}
                              width={300}
                              height={450}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <h4 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {movie.title}
                          </h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>

      <CGVFooter />
    </>
  );
}