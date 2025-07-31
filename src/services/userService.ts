import { api } from '@/utils/api';
import { User, ApiResponse, PaginatedResponse } from '@/types';

interface UserApiResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export const userService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}): Promise<{ data: User[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    if (search.trim()) {
      params.append('search', search);
    }
    const response = await api.get<UserApiResponse>(`/v1/users?${params}`);
    return {
      data: response.data.users,
      total: response.data.total,
      totalPages: Math.ceil(response.data.total / response.data.limit)
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<{ success: boolean; user: User }>(`/v1/users/${id}`);
    return response.data.user;
  },

  create: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>): Promise<User> => {
    const response = await api.post<{ success: boolean; user: User }>('/v1/users', user);
    return response.data.user;
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await api.patch<{ success: boolean; user: User }>(`/v1/users/${id}`, user);
    return response.data.user;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/users/${id}`);
  }
};