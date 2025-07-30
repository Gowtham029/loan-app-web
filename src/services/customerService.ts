import { api } from '@/utils/api';
import { Customer } from '@/types';

interface CustomerApiResponse {
  success: boolean;
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
}

export const customerService = {
  getAll: async (page = 1, limit = 10, search = ''): Promise<{ data: Customer[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search.trim()) {
      params.append('search', search);
    }
    const response = await api.get<CustomerApiResponse>(`/v1/customers?${params}`);
    return {
      data: response.data.customers,
      total: response.data.total,
      totalPages: Math.ceil(response.data.total / response.data.limit)
    };
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<{ success: boolean; customer: Customer }>(`/v1/customers/${id}`);
    return response.data.customer;
  },

  create: async (customer: Omit<Customer, 'customerId' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const response = await api.post<{ success: boolean; customer: Customer }>('/v1/customers', customer);
    return response.data.customer;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.patch<{ success: boolean; customer: Customer }>(`/v1/customers/${id}`, customer);
    return response.data.customer;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/customers/${id}`);
  }
}