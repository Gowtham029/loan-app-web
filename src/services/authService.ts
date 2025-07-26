import { api } from '@/utils/api';
import { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/v1/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/v1/auth/logout');
  }
};