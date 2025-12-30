import axios from 'axios';

const baseUrl = '/api/news';

export interface News {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  create_at: string | null;
  update_at: string | null;
  is_deleted: boolean;
}

export interface CreateNewsForm {
  title: string;
  content: string;
  image_url?: string;
}

export interface UpdateNewsForm {
  title?: string;
  content?: string;
  image_url?: string;
}

export interface NewsPage {
  content: News[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetNewsParams {
  page?: number;
  size?: number;
  search?: string;
}

export const newsService = {
  getNews: async (params: GetNewsParams = {}): Promise<NewsPage> => {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  },

  getNewsById: async (id: number): Promise<News> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },

  createNews: async (data: CreateNewsForm): Promise<News> => {
    const response = await axios.post(baseUrl, data);
    return response.data;
  },

  updateNews: async (id: number, data: UpdateNewsForm): Promise<void> => {
    await axios.put(`${baseUrl}/${id}`, data);
  },

  deleteNews: async (id: number): Promise<void> => {
    await axios.delete(`${baseUrl}/${id}`);
  },
};
