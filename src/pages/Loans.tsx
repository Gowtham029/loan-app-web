import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Select } from '@/components/UI/Select';
import { Notification } from '@/components/UI/Notification';
import { useNotification } from '@/hooks/useNotification';
import { loanService } from '@/services/loanService';
import { Loan, Customer, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Loan | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewPaymentsModal, setViewPaymentsModal] = useState(false);
  const [selectedLoanPayments, setSelectedLoanPayments] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const { notification, showNotification, hideNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Loan>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'COMPLETED': return 'text-blue-600 bg-blue-100';
      case 'DEFAULTED': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns: TableColumn[] = [
    { key: 'loanId', label: 'Loan ID', sortable: true },
    { 
      key: 'customer', 
      label: 'Customer', 
      sortable: true,
      render: (value, row) => `${row.customer.firstName} ${row.customer.lastName}`
    },
    { 
      key: 'principalAmount', 
      label: 'Amount', 
      sortable: true,
      render: (value) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'balanceRemaining', 
      label: 'Balance', 
      sortable: true,
      render: (value) => `₹${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value) => (
        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(value))}>
          {value}
        </span>
      )
    },
  ];

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await loanService.getAll(currentPage, 10, searchValue);
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
  }, [currentPage, searchValue]);

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
    setSelectedCustomer(loan.customer);
    reset(loan);
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
      await loanService.delete(deleteConfirm.id);
      showNotification('success', 'Loan deleted successfully');
      fetchLoans();
    } catch (error) {
      showNotification('error', 'Failed to delete loan');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onSubmit = async (data: Loan) => {
    if (!selectedCustomer) {
      showNotification('error', 'Please select a customer');
      return;
    }

    try {
      const loanData = {
        customer: {
          customerId: selectedCustomer.customerId,
          firstName: selectedCustomer.firstName,
          lastName: selectedCustomer.lastName,
          email: selectedCustomer.email,
          phoneNumber: selectedCustomer.phoneNumber
        },
        principalAmount: Number(data.principalAmount),
        interestRateType: data.interestRateType,
        interestRate: Number(data.interestRate),
        ...(data.interestRateType === 'PAISA' && data.paisaRate ? {
          paisaRate: {
            ratePer100: Number(data.paisaRate.ratePer100),
            frequency: data.paisaRate.frequency
          }
        } : {}),
        loanTerm: Number(data.loanTerm),
        repaymentFrequency: data.repaymentFrequency,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        balanceRemaining: Number(data.balanceRemaining || data.principalAmount)
      };
      
      if (editingLoan) {
        await loanService.update(editingLoan.id, loanData);
        showNotification('success', 'Loan updated successfully');
      } else {
        await loanService.create(loanData);
        showNotification('success', 'Loan created successfully');
      }
      handleModalClose();
      fetchLoans();
    } catch (error) {
      showNotification('error', 'Failed to save loan');
    }
  };

  const handleViewPayments = async (loan: Loan) => {
    try {
      const response = await fetch(`/api/v1/payments?loanId=${loan.loanId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSelectedLoanPayments(data.data?.payments || []);
      setSelectedLoanId(loan.loanId);
      setViewPaymentsModal(true);
    } catch (error) {
      showNotification('error', 'Failed to fetch payments');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {totalCount} loans
          </p>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden">
          {error ? (
            <div className="text-center py-8">
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
            <Table
              columns={columns}
              data={loans}
              loading={loading}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onEdit={canWrite ? handleEdit : undefined}
              onDelete={canWrite ? handleDelete : undefined}
              onAdd={canWrite ? () => setIsModalOpen(true) : undefined}
              onViewPayments={handleViewPayments}
              entityName="loans"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingLoan ? 'Edit Loan' : 'Add Loan'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer *
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm">
                    {selectedCustomer.firstName} {selectedCustomer.lastName} - {selectedCustomer.email}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search customer by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  {customerResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {customerResults.map((customer) => (
                        <button
                          key={customer.customerId}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch('');
                            setCustomerResults([]);
                          }}
                        >
                          <div className="text-sm font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer.email} • {customer.phoneNumber}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Principal Amount"
                type="number"
                required
                {...register('principalAmount', { required: 'Principal Amount is required' })}
                error={errors.principalAmount?.message}
              />
              <Input
                label="Interest Rate"
                type="number"
                step="0.01"
                required
                {...register('interestRate', { required: 'Interest Rate is required' })}
                error={errors.interestRate?.message}
              />
              <Select
                label="Interest Rate Type"
                required
                options={[
                  { value: 'PERCENTAGE', label: 'Percentage' },
                  { value: 'PAISA', label: 'Paisa' }
                ]}
                {...register('interestRateType', { required: 'Interest Rate Type is required' })}
                error={errors.interestRateType?.message}
              />
              <Input
                label="Loan Term (months)"
                type="number"
                required
                {...register('loanTerm', { required: 'Loan Term is required' })}
                error={errors.loanTerm?.message}
              />
              <Select
                label="Repayment Frequency"
                required
                options={[
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'WEEKLY', label: 'Weekly' },
                  { value: 'DAILY', label: 'Daily' }
                ]}
                {...register('repaymentFrequency', { required: 'Repayment Frequency is required' })}
                error={errors.repaymentFrequency?.message}
              />
              <Input
                label="Start Date"
                type="date"
                required
                {...register('startDate', { required: 'Start Date is required' })}
                error={errors.startDate?.message}
              />
              <Input
                label="End Date"
                type="date"
                required
                {...register('endDate', { required: 'End Date is required' })}
                error={errors.endDate?.message}
              />
              <Input
                label="Balance Remaining"
                type="number"
                {...register('balanceRemaining')}
              />
              <Select
                label="Status"
                required
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'DEFAULTED', label: 'Defaulted' }
                ]}
                {...register('status', { required: 'Status is required' })}
                error={errors.status?.message}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingLoan ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete loan "{deleteConfirm?.loanId}"?</p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={viewPaymentsModal}
        onClose={() => setViewPaymentsModal(false)}
        title={`Payments for Loan ${selectedLoanId}`}
        size="xl"
      >
        <div className="space-y-4">
          {selectedLoanPayments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payments found for this loan</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {selectedLoanPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{payment.paymentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">₹{payment.paymentDetails.paidAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', 
                          payment.status === 'COMPLETED' ? 'text-green-600 bg-green-100' :
                          payment.status === 'PENDING' ? 'text-yellow-600 bg-yellow-100' :
                          payment.status === 'FAILED' ? 'text-red-600 bg-red-100' :
                          'text-gray-600 bg-gray-100'
                        )}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {payment.paymentDetails.paidDate ? new Date(payment.paymentDetails.paidDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{payment.paymentMethod.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setViewPaymentsModal(false)}>Close</Button>
          </div>
        </div>
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