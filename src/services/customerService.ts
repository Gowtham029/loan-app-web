import { api } from '@/utils/api';
import { Customer, ApiResponse, PaginatedResponse } from '@/types';

export const customerService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      ...filters
    });
    const response = await api.get<ApiResponse<PaginatedResponse<Customer>>>(`/v1/customers?${params}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<ApiResponse<Customer>>(`/v1/customers/${id}`);
    return response.data.data;
  },

  create: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const response = await api.post<ApiResponse<Customer>>('/v1/customers', customer);
    return response.data.data;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.patch<ApiResponse<Customer>>(`/v1/customers/${id}`, customer);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/customers/${id}`);
  }
};