import axios from 'axios';

export interface Province {
  id: number;
  province_name: string;
  is_deleted?: boolean | null;
}

export interface CreateProvinceDto {
  province_name: string;
}

export interface UpdateProvinceDto {
  province_name?: string;
}

export interface ProvincePage {
  content: Province[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ProvinceFilterParams {
  search?: string;
  page?: number;
  size?: number;
}

class ProvinceService {
  private baseUrl = '/api/provinces';

  async getProvinces(params?: ProvinceFilterParams): Promise<ProvincePage> {
    const { data } = await axios.get<ProvincePage>(this.baseUrl, { params });
    return data;
  }

  async getProvince(id: number): Promise<Province> {
    const { data } = await axios.get<Province>(`${this.baseUrl}/${id}`);
    return data;
  }

  async createProvince(data: CreateProvinceDto): Promise<void> {
    await axios.post(this.baseUrl, data);
  }

  async updateProvince(id: number, data: UpdateProvinceDto): Promise<void> {
    await axios.put(`${this.baseUrl}/${id}`, data);
  }

  async deleteProvince(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }
}

export const provinceService = new ProvinceService();
