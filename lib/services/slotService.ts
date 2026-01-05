import axios from 'axios';
import { ReactNode } from 'react';

const baseUrl = '/api/slots';

export interface Slot {
  id: number;
  movie_id: number;
  room_id: number | null;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
  create_date: string | null;
  is_deleted: boolean;
  movies?: {
    id: number;
    title: string;
    duration?: number;
  };
  rooms?: {
    id: number;
    room_name: string;
    cinemas?: {
      cinema_name: string;
    };
  } | null;
}

export interface CreateSlotForm {
  movieId: number;      // ✅ camelCase
  roomId: number;       // ✅ camelCase
  showTime: string;     // ✅ camelCase - Format: "yyyy-MM-dd HH:mm:ss"
  endTime: string;      // ✅ camelCase - Format: "yyyy-MM-dd HH:mm:ss"
}

export interface UpdateSlotForm {
  movieId: number;      // ✅ camelCase
  roomId: number;       // ✅ camelCase
  showTime: string;     // ✅ camelCase - Format: "yyyy-MM-dd HH:mm:ss"
  endTime: string;      // ✅ camelCase - Format: "yyyy-MM-dd HH:mm:ss"
}

export interface SlotPage {
  content: Slot[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetSlotsParams {
  page?: number;
  size?: number;
  search?: string;
  movieId?: number;     // ✅ camelCase
  roomId?: number;      // ✅ camelCase
  date?: string;
  provinceId?: number;  // ✅ camelCase
}

export const slotService = {
  /**
   * Lấy danh sách slots với phân trang và filter
   */
  getSlots: async (params: GetSlotsParams = {}): Promise<SlotPage> => {
    console.log('🔍 [SlotService] Fetching slots with params:', params);
    
    try {
      const response = await axios.get(baseUrl, { params });
      console.log('✅ [SlotService] Slots fetched successfully:', response.data.content.length, 'items');
      return response.data;
    } catch (error) {
      console.error('❌ [SlotService] Error fetching slots:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          url: error.config?.url,
        });
      }
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết slot theo ID
   */
  getSlotById: async (id: number): Promise<Slot> => {
    console.log('🔍 [SlotService] Fetching slot by ID:', id);
    
    try {
      const response = await axios.get(`${baseUrl}/${id}`);
      console.log('✅ [SlotService] Slot fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [SlotService] Error fetching slot by ID:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
        });
      }
      throw error;
    }
  },

  /**
   * Tạo slot mới
   * @param data - Dữ liệu slot (showTime, endTime format: "yyyy-MM-dd HH:mm:ss")
   */
  createSlot: async (data: CreateSlotForm): Promise<Slot> => {
    console.log('📝 [SlotService] Creating slot:', data);
    
    try {
      const response = await axios.post(baseUrl, data);
      console.log('✅ [SlotService] Slot created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [SlotService] Error creating slot:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        });
        // Ném lỗi với message từ backend
        throw new Error(error.response?.data?.message || 'Không thể tạo suất chiếu');
      }
      throw error;
    }
  },

  /**
   * Cập nhật slot
   * @param id - ID của slot
   * @param data - Dữ liệu cập nhật (showTime, endTime format: "yyyy-MM-dd HH:mm:ss")
   */
  updateSlot: async (id: number, data: UpdateSlotForm): Promise<void> => {
    console.log('📝 [SlotService] Updating slot:', id, data);
    
    try {
      await axios.put(`${baseUrl}/${id}`, data);
      console.log('✅ [SlotService] Slot updated successfully');
    } catch (error) {
      console.error('❌ [SlotService] Error updating slot:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        });
        // Ném lỗi với message từ backend
        throw new Error(error.response?.data?.message || 'Không thể cập nhật suất chiếu');
      }
      throw error;
    }
  },

  /**
   * Xóa slot (soft delete)
   */
  deleteSlot: async (id: number): Promise<void> => {
    console.log('🗑️ [SlotService] Deleting slot:', id);
    
    try {
      await axios.delete(`${baseUrl}/${id}`);
      console.log('✅ [SlotService] Slot deleted successfully');
    } catch (error) {
      console.error('❌ [SlotService] Error deleting slot:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Error details:', {
          status: error.response?.status,
          message: error.response?.data?.message,
        });
        throw new Error(error.response?.data?.message || 'Không thể xóa suất chiếu');
      }
      throw error;
    }
  },

  /**
   * Lấy danh sách slots theo phim
   */
  getSlotsByMovie: async (movieId: number, params: GetSlotsParams = {}): Promise<SlotPage> => {
    console.log('🎬 [SlotService] Fetching slots by movie:', movieId);
    
    return slotService.getSlots({
      ...params,
      movieId,
    });
  },

  /**
   * Lấy danh sách slots theo phòng chiếu
   */
  getSlotsByRoom: async (roomId: number, params: GetSlotsParams = {}): Promise<SlotPage> => {
    console.log('🏛️ [SlotService] Fetching slots by room:', roomId);
    
    return slotService.getSlots({
      ...params,
      roomId,
    });
  },

  /**
   * Lấy danh sách slots theo ngày
   */
  getSlotsByDate: async (date: string, params: GetSlotsParams = {}): Promise<SlotPage> => {
    console.log('📅 [SlotService] Fetching slots by date:', date);
    
    return slotService.getSlots({
      ...params,
      date,
    });
  },

  /**
   * Lấy danh sách slots theo tỉnh/thành
   */
  getSlotsByProvince: async (provinceId: number, params: GetSlotsParams = {}): Promise<SlotPage> => {
    console.log('🌍 [SlotService] Fetching slots by province:', provinceId);
    
    return slotService.getSlots({
      ...params,
      provinceId,
    });
  },
};