import { api } from '@/utils/api';
import { Loan, Customer } from '@/types';

interface LoanApiResponse {
  success: boolean;
  loans: Loan[];
  total: number;
  page: number;
  limit: number;
}

interface CustomerSearchResponse {
  success: boolean;
  customers: Customer[];
}

export const loanService = {
  getAll: async (page = 1, limit = 10, search = '', filters = {}): Promise<{ data: Loan[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    if (search.trim()) {
      params.append('search', search);
    }
    const response = await api.get<LoanApiResponse>(`/v1/loans?${params}`);
    return {
      data: response.data.loans,
      total: response.data.total,
      totalPages: Math.ceil(response.data.total / response.data.limit)
    };
  },

  getById: async (id: string): Promise<Loan> => {
    const response = await api.get<{ success: boolean; loan: Loan }>(`/v1/loans/${id}`);
    return response.data.loan;
  },

  create: async (loan: Omit<Loan, 'id' | 'loanId' | 'createdAt' | 'updatedAt' | 'loanProvider' | 'updatedBy'>): Promise<Loan> => {
    const response = await api.post<{ success: boolean; loan: Loan }>('/v1/loans', loan);
    return response.data.loan;
  },

  update: async (id: string, loan: Partial<Loan>): Promise<Loan> => {
    const response = await api.patch<{ success: boolean; loan: Loan }>(`/v1/loans/${id}`, loan);
    return response.data.loan;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/v1/loans/${id}`);
  },

  searchCustomers: async (search: string): Promise<Customer[]> => {
    const response = await api.get<CustomerSearchResponse>(`/v1/customers?page=1&limit=10&search=${encodeURIComponent(search)}`);
    return response.data.customers;
  }
};