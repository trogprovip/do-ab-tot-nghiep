/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Empty, Input } from 'antd';
import {
    PlayCircleFilled,
    ShoppingCartOutlined,
    SearchOutlined,
    FireFilled,
    ClockCircleFilled,
    StarFilled,
    CaretRightFilled
} from '@ant-design/icons';
import Link from 'next/link';
import { movieService, Movie } from '@/lib/services/movieService';
import CGVHeader from '@/components/cgv/CGVHeader';
import CGVFooter from '@/components/cgv/CGVFooter';

const TABS = [
    { key: 'now_showing', label: 'PHIM ĐANG CHIẾU', icon: <FireFilled /> },
    { key: 'coming_soon', label: 'PHIM SẮP CHIẾU', icon: <ClockCircleFilled /> },
    { key: 'all', label: 'TẤT CẢ', icon: <StarFilled /> },
];

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('now_showing');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMovies(activeTab);
    }, [activeTab]);

    const fetchMovies = async (status: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await movieService.getMovies({
                status: status === 'all' ? undefined : status,
                page: 0,
                size: 50,
            });
            setMovies(response.content);
        } catch (err) {
            console.error('Error fetching movies:', err);
            setError('Không thể tải danh sách phim');
        } finally {
            setLoading(false);
        }
    };

    const formatDateShort = (date: Date | null) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FFFDF8] relative font-sans">
            <CGVHeader />

            <div className="container mx-auto px-4 py-8 mt-20">

                {/* SECTION HEADER */}
                <div className="text-center mb-10 relative">
                    <h1 className="text-4xl md:text-5xl font-black text-red-700 uppercase tracking-wide drop-shadow-sm mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
                        Danh Sách Phim
                    </h1>
                    <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
                </div>

                {/* TOOLBAR */}
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6 mb-12">
                    <div className="bg-white p-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 flex overflow-x-auto max-w-full">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                            px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap
                            ${activeTab === tab.key
                                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md transform scale-105'
                                        : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}
                        `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="w-full xl:w-96">
                        <Input
                            size="large"
                            placeholder="Tìm kiếm phim..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-full border-gray-200 hover:border-red-400 focus:border-red-500 px-5 py-2.5 shadow-sm bg-white"
                        />
                    </div>
                </div>

                {/* LOADING & ERROR */}
                {loading && (
                    <div className="flex flex-col justify-center items-center py-24">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-500 font-bold">Đang tải phim...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="py-20 flex justify-center">
                        <Empty description={<span className="text-gray-500">{error}</span>} />
                    </div>
                )}

                {/* MOVIES GRID */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                        {filteredMovies.map((movie) => {
                            const ageLabel = 'T16';
                            const ageColorBg = 'bg-[#D80000]';

                            return (
                                // CARD CONTAINER: Thêm class 'group' để xử lý hover cho con
                                // Thêm hover:-translate-y-3 (bay lên) và hover:shadow (đổ bóng đỏ)
                                <div key={movie.id} className="group bg-white border-2 border-red-600 rounded-3xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-[0_20px_50px_rgba(220,38,38,0.25)] hover:-translate-y-3 hover:border-red-500 transition-all duration-300 ease-in-out">

                                    {/* POSTER CONTAINER */}
                                    <div className="relative p-1.5">
                                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100">
                                            {movie.poster_url ? (
                                                // ẢNH: Thêm scale-110 khi hover vào group cha
                                                <img
                                                    src={movie.poster_url}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                                    <PlayCircleFilled className="text-6xl" />
                                                </div>
                                            )}

                                            {/* Lớp phủ đen mờ nhẹ khi hover để làm nổi nút Play hơn */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-0"></div>

                                            {/* Age Badge */}
                                            <div className={`absolute top-2 left-2 ${ageColorBg} text-white text-[13px] font-bold px-2.5 py-0.5 rounded-[4px] z-10 shadow-md`}>
                                                {ageLabel}
                                            </div>

                                            {/* Play Button: Phóng to và xoay nhẹ khi hover */}
                                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg pl-1 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-red-500/50">
                                                    <CaretRightFilled className="text-3xl text-red-600" />
                                                </div>
                                            </div>

                                            {/* Release Date Badge */}
                                            <div className="absolute bottom-2 right-2 bg-[#FBD30D] text-black text-sm font-bold px-3 py-1 rounded-md z-10 border border-yellow-500/20 shadow-sm">
                                                {formatDateShort(movie.release_date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CONTENT INFO */}
                                    <div className="px-3 pb-4 pt-2 flex flex-col flex-1 justify-between relative bg-white z-20">
                                        <div>
                                            <h3 className="font-black text-red-700 text-xl uppercase leading-tight mb-1 line-clamp-2 transition-colors group-hover:text-red-600" title={movie.title}>
                                                {movie.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm font-medium line-clamp-1 truncate">
                                                Thể loại: {movie.genre || 'Hành động, Viễn tưởng...'}
                                            </p>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <Link href={`/cgv/movies/${movie.id}`} className="flex-1">
                                                <button className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-red-600 text-red-700 hover:bg-red-50 transition-colors uppercase">
                                                    CHI TIẾT
                                                </button>
                                            </Link>
                                            <Link href={`/cgv/movies/${movie.id}/showtimes`} className="flex-1">
                                                {/* Nút Mua Vé: Rực sáng hơn khi hover cả card */}
                                                <button className="w-full py-2.5 rounded-xl font-bold text-sm bg-red-600 text-white group-hover:bg-red-700 group-hover:shadow-lg transition-all uppercase flex items-center justify-center gap-1">
                                                    <ShoppingCartOutlined /> MUA VÉ
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <CGVFooter />
        </div>
    );
}