import axios from 'axios';

const baseUrl = '/api/slots';

export interface Slot {
  id: number;
  movie_id: number;
  room_id: number | null;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
  create_at: string | null;
  is_deleted: boolean;
  movies?: {
    id: number;
    title: string;
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
  movie_id: number;
  room_id: number;
  show_time: string;
  end_time: string;
  price: number;
  empty_seats: number;
}

export interface UpdateSlotForm {
  movie_id?: number;
  room_id?: number;
  show_time?: string;
  end_time?: string;
  price?: number;
  empty_seats?: number;
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
  movie_id?: number;
  room_id?: number;
  date?: string;
  province_id?: number;
}

export const slotService = {
  getSlots: async (params: GetSlotsParams = {}): Promise<SlotPage> => {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  },

  getSlotById: async (id: number): Promise<Slot> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },

  createSlot: async (data: CreateSlotForm): Promise<Slot> => {
    const response = await axios.post(baseUrl, data);
    return response.data;
  },

  updateSlot: async (id: number, data: UpdateSlotForm): Promise<void> => {
    await axios.put(`${baseUrl}/${id}`, data);
  },

  deleteSlot: async (id: number): Promise<void> => {
    await axios.delete(`${baseUrl}/${id}`);
  },
};
