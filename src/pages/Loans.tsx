import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Phone } from 'lucide-react';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Select } from '@/components/UI/Select';
import { Notification } from '@/components/UI/Notification';
import { useNotification } from '@/hooks/useNotification';
import { loanService } from '@/services/loanService';
import { Loan, LoanRequest, LoanFilters, Customer, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';
import { cn } from '@/utils/cn';

interface LoanFormData {
  originalPrincipal: number;
  annualPercentage: number;
  paisaAmount: number;
  termMonths: number;
  monthlyInterest: number;
  totalAmountWithInterest: number;
  repaymentFrequency: 'MONTHLY' | 'WEEKLY' | 'DAILY';
  type: 'FLEXIBLE' | 'FIXED';
  startDate: string;
  endDate: string;
}

export const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LoanFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Loan | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loanDetailsModal, setLoanDetailsModal] = useState(false);
  const [selectedLoanDetails, setSelectedLoanDetails] = useState<Loan | null>(null);
  const [loanPayments, setLoanPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
    getValues,
  } = useForm<LoanFormData>({ mode: 'onChange' });

  const watchAnnualRate = watch('annualPercentage');
  const watchPaisaAmount = watch('paisaAmount');
  const watchPrincipal = watch('originalPrincipal');
  const watchTermMonths = watch('termMonths');
  const watchStartDate = watch('startDate');
  
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    if (watchAnnualRate && watchPrincipal && watchTermMonths && !isNaN(watchAnnualRate) && !isNaN(watchPrincipal) && !isNaN(watchTermMonths)) {
      isUpdatingRef.current = true;
      const principal = Number(watchPrincipal);
      const rate = Number(watchAnnualRate);
      const termMonths = Number(watchTermMonths);
      const paisaValue = (principal * rate * termMonths) / (100 * 12);
      const monthlyInterest = paisaValue / termMonths;
      const totalAmount = principal + paisaValue;
      
      setValue('paisaAmount', Number(paisaValue.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      setValue('monthlyInterest', Number(monthlyInterest.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      setValue('totalAmountWithInterest', Number(totalAmount.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    }
  }, [watchAnnualRate, watchPrincipal, watchTermMonths]);

  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    if (watchPaisaAmount && watchPrincipal && watchTermMonths && watchPrincipal > 0 && !isNaN(watchPaisaAmount) && !isNaN(watchPrincipal) && !isNaN(watchTermMonths)) {
      isUpdatingRef.current = true;
      const principal = Number(watchPrincipal);
      const paisa = Number(watchPaisaAmount);
      const termMonths = Number(watchTermMonths);
      const percentageValue = (paisa * 100 * 12) / (principal * termMonths);
      const monthlyInterest = paisa / termMonths;
      const totalAmount = principal + paisa;
      
      setValue('annualPercentage', Number(percentageValue.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      setValue('monthlyInterest', Number(monthlyInterest.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      setValue('totalAmountWithInterest', Number(totalAmount.toFixed(2)), { shouldValidate: false, shouldDirty: false });
      
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    }
  }, [watchPaisaAmount, watchPrincipal, watchTermMonths]);

  useEffect(() => {
    if (watchStartDate && watchTermMonths && !isNaN(watchTermMonths)) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Number(watchTermMonths));
      setValue('endDate', endDate.toISOString().split('T')[0], { shouldValidate: false, shouldDirty: false });
    }
  }, [watchStartDate, watchTermMonths]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'OVERDUE': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'DEFAULTED': return 'text-red-700 bg-red-50 border-red-200';
      case 'PAID_OFF': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'RESTRUCTURED': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getSubstatusColor = (substatus: string) => {
    switch (substatus) {
      case 'CURRENT': return 'text-green-700 bg-green-50 border-green-200';
      case 'GRACE_PERIOD': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'DELINQUENT': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const columns: TableColumn[] = [
    { 
      key: 'loanId', 
      label: 'Loan ID', 
      sortable: true,
      render: (value, row) => (
        <button
          onClick={() => handleViewLoanDetails(row)}
          className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
        >
          {value}
        </button>
      )
    },
    { 
      key: 'customer', 
      label: 'Customer', 
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.customer.firstName} {row.customer.lastName}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {row.customer.phoneNumber}
          </span>
        </div>
      )
    },
    { 
      key: 'originalPrincipal', 
      label: 'Principal', 
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            ₹{value?.toLocaleString()}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            Received: ₹{(value - row.currentPrincipal)?.toLocaleString()}
          </span>
        </div>
      )
    },
    { 
      key: 'interestRate', 
      label: 'Interest Rate', 
      sortable: false,
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ₹{(value?.totalInterestRupees || 0).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value?.annualPercentage || 'N/A'}% Annual
          </span>
        </div>
      )
    },
    { 
      key: 'termMonths', 
      label: 'Term', 
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {value} months
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Remaining: {row.remainingTerms}
          </span>
        </div>
      )
    },
    { 
      key: 'currentPrincipal', 
      label: 'Pending Principal', 
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-orange-600 dark:text-orange-400">
          ₹{value?.toLocaleString() || 'N/A'}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col space-y-1">
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            getStatusColor(value)
          )}>
            {value}
          </span>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            getSubstatusColor(row.substatus)
          )}>
            {row.substatus}
          </span>
        </div>
      )
    },
  ];

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanService.getAll(currentPage, 10, filters);
      setLoans(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch loans';
      setError(errorMessage);
      setLoans([]);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomerResults([]);
      return;
    }
    try {
      const customers = await loanService.searchCustomers(query);
      setCustomerResults(customers);
    } catch (error) {
      console.error('Customer search failed:', error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [currentPage, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCustomers(customerSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearch]);

  const handleEdit = (loan: Loan) => {
    if (!hasPermission(currentUser, 'write')) {
      showNotification('error', 'You do not have permission to edit loans');
      return;
    }
    setEditingLoan(loan);
    setSelectedCustomer(loan.customer as Customer);
    const paisaAmount = Number(loan.interestRate.totalInterestRupees) || 0;
    const monthlyInterest = Number(loan.interestRate.monthlyInterestRupees) || 0;
    const totalAmount = Number(loan.originalPrincipal) + paisaAmount;
    
    reset({
      originalPrincipal: loan.originalPrincipal,
      annualPercentage: loan.interestRate.annualPercentage,
      paisaAmount: paisaAmount,
      termMonths: loan.termMonths,
      monthlyInterest: monthlyInterest,
      totalAmountWithInterest: totalAmount,
      repaymentFrequency: loan.repaymentFrequency,
      type: loan.type,
      startDate: loan.startDate.split('T')[0],
      endDate: loan.endDate.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    if (!hasPermission(currentUser, 'delete')) {
      showNotification('error', 'You do not have permission to delete loans');
      return;
    }
    setDeleteConfirm(loan);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await loanService.delete(deleteConfirm.loanId);
      showNotification('success', 'Loan deleted successfully');
      fetchLoans();
    } catch (error) {
      showNotification('error', 'Failed to delete loan');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onSubmit = async (data: LoanFormData) => {
    if (!selectedCustomer) {
      showNotification('error', 'Please select a customer');
      return;
    }

    try {
      const loanRequest: LoanRequest = {
        customer: {
          customerId: selectedCustomer.customerId,
          firstName: selectedCustomer.firstName,
          lastName: selectedCustomer.lastName,
          email: selectedCustomer.email,
          phoneNumber: selectedCustomer.phoneNumber
        },
        originalPrincipal: Number(data.originalPrincipal),
        interestRate: {
          annualPercentage: Number(data.annualPercentage),
          monthlyPercentage: Number((data.annualPercentage / 12).toFixed(2))
        },
        termMonths: Number(data.termMonths),
        repaymentFrequency: data.repaymentFrequency,
        type: data.type,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString()
      };
      
      if (editingLoan) {
        const dirtyFields = getValues();
        const originalData = {
          originalPrincipal: editingLoan.originalPrincipal,
          annualPercentage: editingLoan.interestRate.annualPercentage,
          termMonths: editingLoan.termMonths,
          repaymentFrequency: editingLoan.repaymentFrequency,
          type: editingLoan.type,
          startDate: editingLoan.startDate.split('T')[0],
          endDate: editingLoan.endDate.split('T')[0]
        };
        const updateData: any = {};
        
        if (data.originalPrincipal !== originalData.originalPrincipal) updateData.originalPrincipal = Number(data.originalPrincipal);
        if (data.annualPercentage !== originalData.annualPercentage) {
          updateData.interestRate = {
            annualPercentage: Number(data.annualPercentage),
            monthlyPercentage: Number((data.annualPercentage / 12).toFixed(2))
          };
        }
        if (data.termMonths !== originalData.termMonths) updateData.termMonths = Number(data.termMonths);
        if (data.repaymentFrequency !== originalData.repaymentFrequency) updateData.repaymentFrequency = data.repaymentFrequency;
        if (data.type !== originalData.type) updateData.type = data.type;
        if (data.startDate !== originalData.startDate) updateData.startDate = new Date(data.startDate).toISOString();
        if (data.endDate !== originalData.endDate) updateData.endDate = new Date(data.endDate).toISOString();
        
        console.log('Update data:', updateData);
        await loanService.update(editingLoan.loanId, updateData);
        showNotification('success', 'Loan updated successfully');
      } else {
        await loanService.create(loanRequest);
        showNotification('success', 'Loan created successfully');
      }
      handleModalClose();
      fetchLoans();
    } catch (error: any) {
      console.error('Save loan error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save loan';
      showNotification('error', errorMessage);
    }
  };

  const handleViewLoanDetails = async (loan: Loan) => {
    setSelectedLoanDetails(loan);
    setLoanDetailsModal(true);
    setLoadingPayments(true);
    
    try {
      const response = await fetch(`/api/v1/payments?loanId=${loan.loanId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLoanPayments(data.data?.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setLoanPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLoan(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setCustomerResults([]);
    reset();
  };

  const canWrite = hasPermission(currentUser, 'write');

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Manage loan applications and track loan performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Loans</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
          {error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
                Error Loading Loans
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </div>
              <Button onClick={fetchLoans}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'OVERDUE', label: 'Overdue' },
                    { value: 'DEFAULTED', label: 'Defaulted' },
                    { value: 'PAID_OFF', label: 'Paid Off' },
                    { value: 'RESTRUCTURED', label: 'Restructured' }
                  ]}
                  className="min-w-[120px]"
                />
                <Select
                  value={filters.substatus || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, substatus: e.target.value as any }))}
                  options={[
                    { value: '', label: 'All Sub Status' },
                    { value: 'CURRENT', label: 'Current' },
                    { value: 'GRACE_PERIOD', label: 'Grace Period' },
                    { value: 'DELINQUENT', label: 'Delinquent' }
                  ]}
                  className="min-w-[120px]"
                />
                <Select
                  value={filters.sortBy || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  options={[
                    { value: '', label: 'Default' },
                    { value: 'createdAt', label: 'Created Date' },
                    { value: 'originalPrincipal', label: 'Principal Amount' },
                    { value: 'status', label: 'Status' }
                  ]}
                  className="min-w-[120px]"
                />
                {filters.sortBy && (
                  <Select
                    value={filters.sortOrder || 'desc'}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    options={[
                      { value: 'desc', label: 'Descending' },
                      { value: 'asc', label: 'Ascending' }
                    ]}
                    className="min-w-[120px]"
                  />
                )}
                <Button
                  variant="secondary"
                  onClick={() => setFilters({})}
                  className="whitespace-nowrap"
                >
                  Clear Filters
                </Button>
              </div>
              
              <Table
                columns={columns}
                data={loans}
                loading={loading}
                searchValue={filters.search || ''}
                onSearchChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
                onEdit={canWrite ? handleEdit : undefined}
                onDelete={canWrite ? handleDelete : undefined}
                onAdd={canWrite ? () => setIsModalOpen(true) : undefined}
                entityName="loans"
                fixedHeight
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingLoan ? 'Edit Loan' : 'Create New Loan'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedCustomer.firstName} {selectedCustomer.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                      <span>{selectedCustomer.email}</span>
                      <Phone className="h-3 w-3" />
                      <span>{selectedCustomer.phoneNumber}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Change Customer
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Search customer by name, email, or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
                {customerResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customerResults.map((customer) => (
                      <button
                        key={customer.customerId}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch('');
                          setCustomerResults([]);
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              {customer.firstName[0]}{customer.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                              <span>{customer.email}</span>
                              <Phone className="h-3 w-3" />
                              <span>{customer.phoneNumber}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Principal Amount (₹)"
                  type="number"
                  required
                  {...register('originalPrincipal', { required: 'Principal Amount is required', min: 1 })}
                  error={errors.originalPrincipal?.message}
                  placeholder="Enter loan amount"
                />
                <Input
                  label="Loan Term (Months)"
                  type="number"
                  required
                  {...register('termMonths', { required: 'Loan term is required', min: 1 })}
                  error={errors.termMonths?.message}
                  placeholder="12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Annual Interest Rate (%)"
                  type="number"
                  step="0.01"
                  required
                  disabled={!watchPrincipal || !watchTermMonths}
                  {...register('annualPercentage', { required: 'Annual rate is required', min: 0.01 })}
                  error={errors.annualPercentage?.message}
                  placeholder="18.00"
                />
                <Input
                  label="Interest Amount (₹)"
                  type="number"
                  step="0.01"
                  disabled={!watchPrincipal || !watchTermMonths}
                  {...register('paisaAmount', { min: 0 })}
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Monthly Interest (₹)"
                  type="number"
                  step="0.01"
                  readOnly
                  {...register('monthlyInterest')}
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <Input
                  label="Total Amount (₹)"
                  type="number"
                  step="0.01"
                  readOnly
                  {...register('totalAmountWithInterest')}
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Configuration</h3>
              
              <Select
                label="Loan Type"
                required
                options={[
                  { value: 'FLEXIBLE', label: 'Flexible Loan' },
                  { value: 'FIXED', label: 'Fixed Loan' }
                ]}
                {...register('type', { required: 'Loan type is required' })}
                error={errors.type?.message}
              />

              <Select
                label="Repayment Frequency"
                required
                options={[
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'DAILY', label: 'Daily' }
                ]}
                {...register('repaymentFrequency', { required: 'Repayment frequency is required' })}
                error={errors.repaymentFrequency?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  {...register('startDate', { required: 'Start date is required' })}
                  error={errors.startDate?.message}
                />
                <Input
                  label="End Date"
                  type="date"
                  readOnly
                  {...register('endDate')}
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="min-w-[120px]" 
              disabled={!selectedCustomer || !isValid || (editingLoan && !isDirty)}
            >
              {editingLoan ? 'Update Loan' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Loan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete loan "{deleteConfirm?.loanId}"? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Loan
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={loanDetailsModal}
        onClose={() => setLoanDetailsModal(false)}
        title={`Loan Details - ${selectedLoanDetails?.loanId}`}
        size="xl"
      >
        {selectedLoanDetails && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{selectedLoanDetails.originalPrincipal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Loan Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ₹{(selectedLoanDetails.originalPrincipal - selectedLoanDetails.currentPrincipal).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₹{selectedLoanDetails.currentPrincipal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h3>
              {loadingPayments ? (
                <div className="text-center py-8 text-gray-500">Loading payments...</div>
              ) : loanPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No payments found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {loanPayments.map((payment) => (
                        <tr key={payment._id || payment.paymentId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">
                            {payment.paymentId}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {payment.paymentDetails?.paidDate ? 
                              new Date(payment.paymentDetails.paidDate).toLocaleDateString() : 
                              new Date(payment.createdAt).toLocaleDateString()
                            }
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ₹{(payment.paymentDetails?.paidAmount || payment.amount || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                              payment.status === 'COMPLETED' ? 'text-green-700 bg-green-50 border-green-200' :
                              payment.status === 'PENDING' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
                              payment.status === 'FAILED' ? 'text-red-700 bg-red-50 border-red-200' :
                              'text-gray-700 bg-gray-50 border-gray-200'
                            )}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {payment.paymentMethod?.type || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => setLoanDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </Layout>
  );
};