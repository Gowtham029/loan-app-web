import { api } from '@/utils/api';
import { Payment, Loan } from '@/types';

interface PaymentApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    payments: Payment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalPaidAmount: number;
      totalPrincipalPaid: number;
      totalInterestPaid: number;
      completedPayments: number;
      pendingPayments: number;
    };
  };
}

interface SinglePaymentResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: Payment;
}

export const paymentService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}): Promise<{ data: Payment[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    if (search.trim()) {
      params.append('search', search);
    }
    const response = await api.get<PaymentApiResponse>(`/v1/payments?${params}`);
    return {
      data: response.data.data?.payments || [],
      total: response.data.data?.pagination?.totalRecords || 0,
      totalPages: response.data.data?.pagination?.totalPages || 1
    };
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await api.get<SinglePaymentResponse>(`/v1/payments/${id}`);
    return response.data.data;
  },

  create: async (payment: any): Promise<Payment> => {
    const response = await api.post<SinglePaymentResponse>('/v1/payments', payment);
    return response.data.data;
  },

  update: async (id: string, payment: Partial<Payment>): Promise<Payment> => {
    const response = await api.put<SinglePaymentResponse>(`/v1/payments/${id}`, payment);
    return response.data.data;
  },

  patch: async (id: string, updates: any): Promise<Payment> => {
    const response = await api.patch<SinglePaymentResponse>(`/v1/payments/${id}`, updates);
    return response.data.data;
  },

  delete: async (id: string, reason: string): Promise<void> => {
    await api.delete(`/v1/payments/${id}`, { data: { reason } });
  },

  searchLoans: async (search: string): Promise<Loan[]> => {
    const response = await api.get<{ success: boolean; loans: Loan[] }>(`/v1/loans?page=1&limit=10&search=${encodeURIComponent(search)}`);
    return response.data.loans;
  }
};