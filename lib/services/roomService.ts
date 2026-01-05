import axios from 'axios';

const baseUrl = '/api/rooms';

export interface Room {
  id: number;
  cinema_id: number;
  room_name: string;
  room_type: string | null;
  total_seats: number;
  status: 'active' | 'inactive';
  is_deleted: boolean;
  cinemas?: {
    id: number;
    cinema_name: string;
    provinces?: {
      province_name: string;
    };
  };
}

export interface CreateRoomForm {
  cinema_id: number;
  room_name: string;
  room_type: string;
  total_seats?: number;
  status: 'active' | 'inactive';
}

export interface UpdateRoomForm {
  cinema_id?: number;
  room_name?: string;
  room_type?: string;
  total_seats?: number;
  status?: 'active' | 'inactive';
}

export interface RoomPage {
  content: Room[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetRoomsParams {
  page?: number;
  size?: number;
  search?: string;
  cinema_id?: number;
  status?: 'active' | 'inactive';
}

export const roomService = {
  getRooms: async (params: GetRoomsParams = {}): Promise<RoomPage> => {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  },

  getRoomById: async (id: number): Promise<Room> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },

  createRoom: async (data: CreateRoomForm): Promise<Room> => {
    const response = await axios.post(baseUrl, data);
    return response.data;
  },

  updateRoom: async (id: number, data: UpdateRoomForm): Promise<void> => {
    await axios.put(`${baseUrl}/${id}`, data);
  },

  deleteRoom: async (id: number): Promise<void> => {
    await axios.delete(`${baseUrl}/${id}`);
  },
};
