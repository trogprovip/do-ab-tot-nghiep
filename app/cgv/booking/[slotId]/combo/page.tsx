/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

interface Product {
  id: number;
  product_name: string;
  category: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface ComboItem {
  product: Product;
  quantity: number;
}

export default function ComboPage({ params }: { params: Promise<{ slotId: string }> }) {
  const router = useRouter();
  const [slotId, setSlotId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<ComboItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    params.then(p => {
      setSlotId(p.slotId);
      fetchProducts();
      loadBookingData(p.slotId);
    });
  }, [params]);

  const loadBookingData = (id: string) => {
    const data = sessionStorage.getItem(`booking_${id}`);
    if (data) {
      setBookingData(JSON.parse(data));
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Lấy tất cả sản phẩm (food, drink, combo)
      const response = await fetch('/api/products?size=100');
      const data = await response.json();
      setProducts(data.content || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (product: Product, delta: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prev.filter(item => item.product.id !== product.id);
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (delta > 0) {
        return [...prev, { product, quantity: 1 }];
      }
      return prev;
    });
  };

  const getQuantity = (productId: number) => {
    return selectedCombos.find(item => item.product.id === productId)?.quantity || 0;
  };

  const calculateTotal = () => {
    const comboTotal = selectedCombos.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
    const seatTotal = bookingData?.totalPrice || 0;
    return seatTotal + comboTotal;
  };

  const handleContinue = () => {
    const comboData = {
      combos: selectedCombos,
      comboTotal: selectedCombos.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
    };
    
    sessionStorage.setItem(`combo_${slotId}`, JSON.stringify(comboData));
    router.push(`/cgv/booking/${slotId}/payment`);
  };

  const handleBack = () => {
    router.back();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">BOOKING ONLINE</h1>
        </div>
      </div>

      {/* Booking Info */}
      {bookingData && (
        <div className="bg-yellow-100 py-3">
          <div className="container mx-auto px-4">
            <p className="text-sm">
              <strong>{bookingData.cinema}</strong> | {bookingData.room} | <strong>{bookingData.seats?.length || 0} ghế</strong> ({bookingData.seats?.join(', ')})
            </p>
            <p className="text-sm">
              {bookingData.time}, {bookingData.date}
            </p>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="bg-gray-200 py-3">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-center">Bắp Nước</h2>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const quantity = getQuantity(product.id);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{product.product_name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{product.description}</p>
                  )}
                  <p className="text-red-600 font-bold text-xl mb-4">
                    Giá: {formatPrice(product.price)} đ
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(product, -1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                      >
                        <MinusOutlined />
                      </button>
                      <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product, 1)}
                        className="w-8 h-8 bg-red-600 text-white rounded flex items-center justify-center hover:bg-red-700 transition-colors"
                      >
                        <PlusOutlined />
                      </button>
                    </div>
                    {quantity > 0 && (
                      <span className="text-red-600 font-bold">
                        {formatPrice(product.price * quantity)} đ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left: Movie Info */}
            <div className="flex items-center gap-4">
              {bookingData?.poster && (
                <img
                  src={bookingData.poster}
                  alt={bookingData.movieTitle}
                  className="w-16 h-20 object-cover rounded"
                />
              )}
              <div>
                <p className="font-bold">{bookingData?.movieTitle || 'Phim'}</p>
                <p className="text-sm text-gray-300">{bookingData?.cinema}</p>
                <p className="text-sm text-gray-300">
                  Suất chiếu: {bookingData?.time}, {bookingData?.date}
                </p>
              </div>
            </div>

            {/* Center: Price Info */}
            <div className="text-center">
              <p className="text-sm text-gray-300">Tạm tính</p>
              <p className="text-sm">Ghế: {formatPrice(bookingData?.totalPrice || 0)} đ</p>
              <p className="text-sm">Combo: {formatPrice(selectedCombos.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))} đ</p>
              <p className="text-2xl font-bold text-yellow-400">
                Tổng: {formatPrice(calculateTotal())} đ
              </p>
            </div>

            {/* Right: Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-700 transition-colors"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
              >
                TIẾP TỤC
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-32"></div>
    </div>
  );
}
