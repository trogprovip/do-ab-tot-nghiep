import axios from 'axios';

const baseUrl = '/api/products';

export interface Product {
  id: number;
  product_name: string;
  category: 'food' | 'drink' | 'combo' | 'voucher';
  description: string | null;
  price: number;
  image_url: string | null;
  create_at: string | null;
  is_deleted: boolean;
}

export interface CreateProductForm {
  product_name: string;
  category: 'food' | 'drink' | 'combo' | 'voucher';
  description?: string;
  price: number;
  image_url?: string;
}

export interface UpdateProductForm {
  product_name?: string;
  category?: 'food' | 'drink' | 'combo' | 'voucher';
  description?: string;
  price?: number;
  image_url?: string;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface GetProductsParams {
  page?: number;
  size?: number;
  search?: string;
  category?: 'food' | 'drink' | 'combo' | 'voucher';
}

export const productService = {
  getProducts: async (params: GetProductsParams = {}): Promise<ProductPage> => {
    const response = await axios.get(baseUrl, { params });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await axios.get(`${baseUrl}/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductForm): Promise<Product> => {
    const response = await axios.post(baseUrl, data);
    return response.data;
  },

  updateProduct: async (id: number, data: UpdateProductForm): Promise<void> => {
    await axios.put(`${baseUrl}/${id}`, data);
  },

  deleteProduct: async (id: number): Promise<void> => {
    await axios.delete(`${baseUrl}/${id}`);
  },
};