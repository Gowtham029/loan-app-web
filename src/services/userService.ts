import { api } from '@/utils/api';
import { User, ApiResponse, PaginatedResponse } from '@/types';

export const userService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      ...filters
    });
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(`/v1/users?${params}`);
    return response.data.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/v1/users/${id}`);
    return response.data.data;
  },

  create: async (user: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/v1/users', user);
    return response.data.data;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`/v1/users/${id}`, user);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/users/${id}`);
  }
};