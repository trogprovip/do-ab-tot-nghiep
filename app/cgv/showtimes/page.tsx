// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
// import { Spin } from 'antd';
// import CGVHeader from '@/components/cgv/CGVHeader';
// import CGVFooter from '@/components/cgv/CGVFooter';
// import Link from 'next/link';
// import { provinceService } from '@/lib/services/provinceService';
// import { slotService } from '@/lib/services/slotService';

// interface Province {
//   id: number;
//   province_name: string;
// }

// interface SlotWithDetails {
//   id: number;
//   show_time: string;
//   end_time: string;
//   price: number;
//   empty_seats: number;
//   movies?: {
//     id: number;
//     title: string;
//   };
//   rooms?: {
//     id: number;
//     room_name: string;
//     cinemas?: {
//       id: number;
//       cinema_name: string;
//       address: string;
//       province_id: number;
//     };
//   };
// }

// interface CinemaGroup {
//   cinema_id: number;
//   cinema_name: string;
//   address: string;
//   room_type: string;
//   slots: SlotWithDetails[];
// }

// export default function ShowtimesPage() {
//   const searchParams = useSearchParams();
//   const [selectedDate, setSelectedDate] = useState<string>('');
//   const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
//   const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
//   const [selectedMovie, setSelectedMovie] = useState<any>(null);
//   const [provinces, setProvinces] = useState<Province[]>([]);
//   const [cinemaGroups, setCinemaGroups] = useState<CinemaGroup[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [dates, setDates] = useState<Date[]>([]);

//   const generateDates = () => {
//     // Bắt đầu từ ngày hiện tại
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const dateArray: Date[] = [];
//     for (let i = 0; i < 60; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       dateArray.push(date);
//     }
//     setDates(dateArray);
    
//     // Mặc định chọn ngày hôm nay
//     setSelectedDate(formatDateForAPI(today));
//   };

//   const fetchProvinces = async () => {
//     try {
//       const response = await provinceService.getProvinces({ size: 100 });
//       setProvinces(response.content);
//       if (response.content.length > 0) {
//         setSelectedProvince(response.content[0].id);
//       }
//     } catch (error) {
//       console.error('Error fetching provinces:', error);
//     }
//   };

//   const fetchSlots = async () => {
//     try {
//       setLoading(true);
//       const params: any = {
//         date: selectedDate,
//         size: 1000,
//       };
//       if (selectedProvince) {
//         params.province_id = selectedProvince;
//       }
//       if (selectedMovieId) {
//         params.movie_id = selectedMovieId;
//       }
//       const response = await slotService.getSlots(params);
//       console.log('Slots API Response:', JSON.stringify(response, null, 2));
//       console.log('Params sent:', params);
//       console.log('Raw content length:', response.content.length);
//       console.log('First slot data:', response.content[0]);
//       groupSlotsByCinema(response.content as SlotWithDetails[]);
//       console.log('Cinema groups after grouping:', cinemaGroups.length);
//     } catch (error) {
//       console.error('Error fetching slots:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchMovie = async (movieId: number) => {
//     try {
//       console.log('🔍 Fetching movie with ID:', movieId);
//       const response = await fetch(`/api/movies/${movieId}`);
//       console.log('🔍 Movie API response status:', response.status);
//       const movieData = await response.json();
//       console.log('🔍 Movie API response:', movieData);
//       setSelectedMovie(movieData);
//     } catch (error) {
//       console.error('Error fetching movie:', error);
//     }
//   };

//   useEffect(() => {
//     generateDates();
//     fetchProvinces();
    
//     // Lấy movie_id từ URL
//     const movieIdParam = searchParams.get('movie_id');
//     if (movieIdParam) {
//       const movieId = parseInt(movieIdParam);
//       setSelectedMovieId(movieId);
//       console.log('🔍 Movie ID from URL:', movieIdParam);
//       fetchMovie(movieId);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (selectedDate) {
//       fetchSlots();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedDate, selectedProvince, selectedMovieId]);

//   const groupSlotsByCinema = (slotsData: SlotWithDetails[]) => {
//     const grouped: { [key: number]: CinemaGroup } = {};

//     slotsData.forEach((slot) => {
//       const cinemaId = slot.rooms?.cinemas?.id;
//       if (!cinemaId) return;

//       if (!grouped[cinemaId]) {
//         grouped[cinemaId] = {
//           cinema_id: cinemaId,
//           cinema_name: slot.rooms?.cinemas?.cinema_name || '',
//           address: slot.rooms?.cinemas?.address || '',
//           room_type: slot.rooms?.room_name || 'Rạp 2D',
//           slots: [],
//         };
//       }
//       grouped[cinemaId].slots.push(slot);
//     });

//     setCinemaGroups(Object.values(grouped));
//   };

//   const formatDateForAPI = (date: Date): string => {
//     console.log('🔍 Input date:', date);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const result = `${year}-${month}-${day}`;
//     console.log('🔍 Formatted date:', result);
//     return result;
//   };

//   const formatDateDisplay = (date: Date): string => {
//     const day = String(date.getDate()).padStart(2, '0');
//     return day;
//   };

//   const getDayName = (date: Date): string => {
//     const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
//     return days[date.getDay()];
//   };

//   const getMonthName = (date: Date): string => {
//     const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
//     return months[date.getMonth()];
//   };

//   const formatTime = (dateString: string): string => {
//     try {
//       const date = new Date(dateString);
//       const hours = String(date.getHours()).padStart(2, '0');
//       const minutes = String(date.getMinutes()).padStart(2, '0');
//       return `${hours}:${minutes}`;
//     } catch {
//       return '';
//     }
//   };

//   return (
//     <>
//       <CGVHeader />
//       <div className="min-h-screen bg-[#fdfcf0]">
//         {/* Selected Movie Header */}
//         {selectedMovie && (
//           <div className="bg-black text-white">
//             <div className="container mx-auto px-4 py-6">
//               <div className="flex items-center gap-6">
//                 <img
//                   src={selectedMovie.poster_url || 'https://via.placeholder.com/120x180?text=No+Image'}
//                   alt={selectedMovie.title}
//                   className="w-20 h-28 object-cover rounded-lg shadow-lg"
//                   onError={(e) => {
//                     e.currentTarget.src = 'https://via.placeholder.com/120x180?text=No+Image';
//                   }}
//                 />
//                 <div className="flex-1">
//                   <h1 className="text-2xl font-bold text-red-500 mb-2">{selectedMovie.title}</h1>
//                   <div className="flex items-center gap-4 text-sm text-gray-300">
//                     <span>{selectedMovie.duration || '120'} phút</span>
//                     <span>•</span>
//                     <span>{selectedMovie.genre || 'Hành động'}</span>
//                     <span>•</span>
//                     <span>{selectedMovie.age_rating || 'P'}</span>
//                   </div>
//                   <p className="text-gray-400 mt-2 line-clamp-2">{selectedMovie.description || 'Chọn suất chiếu bên dưới để bắt đầu trải nghiệm.'}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-gray-400 mb-1">Giá vé từ</p>
//                   <p className="text-2xl font-bold text-yellow-400">{selectedMovie.base_price || '80.000'} đ</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Calendar Section */}
//         <div className="bg-white border-b-2 border-gray-200 shadow-sm">
//           <div className="container mx-auto px-4 py-4">
//             <div className="flex items-center gap-2 mb-3">
//               <CalendarOutlined className="text-red-600 text-xl" />
//               <h2 className="text-lg font-bold text-gray-800">Chọn ngày chiếu</h2>
//             </div>
//             <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
//               {dates.map((date, index) => {
//                 const dateStr = formatDateForAPI(date);
//                 const isSelected = dateStr === selectedDate;
//                 return (
//                   <button
//                     key={index}
//                     onClick={() => setSelectedDate(dateStr)}
//                     className={`flex-shrink-0 min-w-[60px] px-3 py-2 rounded-lg border-2 transition-all ${
//                       isSelected
//                         ? 'bg-red-600 border-red-600 text-white'
//                         : 'bg-white border-gray-200 text-gray-700 hover:border-red-300'
//                     }`}
//                   >
//                     <div className="text-xs font-medium">{getMonthName(date)}</div>
//                     <div className="text-xs opacity-70">{getDayName(date)}</div>
//                     <div className="text-2xl font-bold">{formatDateDisplay(date)}</div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Province/City Section */}
//         <div className="bg-gray-50 border-b border-gray-200">
//           <div className="container mx-auto px-4 py-4">
//             <div className="flex items-center gap-2 mb-3">
//               <EnvironmentOutlined className="text-red-600 text-xl" />
//               <h2 className="text-lg font-bold text-gray-800">Chọn thành phố</h2>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {provinces.map((province) => {
//                 const isSelected = province.id === selectedProvince;
//                 return (
//                   <button
//                     key={province.id}
//                     onClick={() => setSelectedProvince(province.id)}
//                     className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
//                       isSelected
//                         ? 'bg-black text-white'
//                         : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
//                     }`}
//                   >
//                     {province.province_name}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* Showtimes Section */}
//         <div className="container mx-auto px-4 py-6">
//           {loading ? (
//             <div className="flex justify-center items-center py-20">
//               <Spin size="large" />
//             </div>
//           ) : cinemaGroups.length === 0 ? (
//             <div className="text-center py-20">
//               <p className="text-gray-500 text-lg">Không có suất chiếu nào trong ngày này</p>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {cinemaGroups.map((cinema) => (
//                 <div key={cinema.cinema_id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
//                   {/* Cinema Header */}
//                   <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4">
//                     <h3 className="font-bold text-lg">{cinema.cinema_name}</h3>
//                     <p className="text-sm text-gray-300 mt-1">{cinema.address}</p>
//                   </div>

//                   {/* Showtimes */}
//                   <div className="p-4">
//                     <div className="flex items-center gap-2 mb-3">
//                       <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-bold">
//                         {cinema.room_type}
//                       </span>
//                     </div>
//                     <div className="flex flex-wrap gap-3">
//                       {cinema.slots
//                         .sort((a, b) => new Date(a.show_time).getTime() - new Date(b.show_time).getTime())
//                         .map((slot) => (
//                           <Link
//                             key={slot.id}
//                             href={`/cgv/booking/${slot.id}`}
//                             className="group"
//                           >
//                             <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-red-600 hover:bg-red-50 transition-all">
//                               <div className="flex items-center gap-2">
//                                 <ClockCircleOutlined className="text-gray-600 group-hover:text-red-600" />
//                                 <span className="font-bold text-lg text-gray-800 group-hover:text-red-600">
//                                   {formatTime(slot.show_time)}
//                                 </span>
//                               </div>
//                               <div className="text-xs text-gray-500 mt-1">
//                                 {slot.empty_seats} ghế trống
//                               </div>
//                             </button>
//                           </Link>
//                         ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <CGVFooter />

//       <style dangerouslySetInnerHTML={{__html: `
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}} />
//     </>
//   );
// }
