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
import { paymentService } from '@/services/paymentService';
import { Payment, Loan, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Payment | null>(null);
  const [loanSearch, setLoanSearch] = useState('');
  const [loanResults, setLoanResults] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'PENDING_VERIFICATION': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns: TableColumn[] = [
    { key: 'paymentId', label: 'Payment ID', sortable: true },
    { key: 'loanId', label: 'Loan ID', sortable: true },
    { 
      key: 'paidAmount', 
      label: 'Amount', 
      sortable: true,
      render: (value, row) => `₹${row.paymentDetails.paidAmount.toLocaleString()}`
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
    { 
      key: 'paidDate', 
      label: 'Date', 
      sortable: true,
      render: (value, row) => row.paymentDetails.paidDate ? new Date(row.paymentDetails.paidDate).toLocaleDateString() : 'N/A'
    },
  ];

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getAll(currentPage, 10, searchValue);
      setPayments(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payments';
      setError(errorMessage);
      setPayments([]);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchLoans = async (query: string) => {
    if (query.length < 2) {
      setLoanResults([]);
      return;
    }
    try {
      const loans = await paymentService.searchLoans(query);
      setLoanResults(loans);
    } catch (error) {
      console.error('Loan search failed:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchValue]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLoans(loanSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [loanSearch]);

  const handleEdit = (payment: Payment) => {
    if (!hasPermission(currentUser, 'write')) {
      showNotification('error', 'You do not have permission to edit payments');
      return;
    }
    setEditingPayment(payment);
    reset(payment);
    setIsModalOpen(true);
  };

  const handleDelete = (payment: Payment) => {
    if (!hasPermission(currentUser, 'delete')) {
      showNotification('error', 'You do not have permission to delete payments');
      return;
    }
    setDeleteConfirm(payment);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await paymentService.delete(deleteConfirm._id, 'Manual deletion');
      showNotification('success', 'Payment deleted successfully');
      fetchPayments();
    } catch (error) {
      showNotification('error', 'Failed to delete payment');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedLoan && !editingPayment) {
      showNotification('error', 'Please select a loan');
      return;
    }

    try {
      const paymentData = {
        loanId: selectedLoan?.loanId || editingPayment?.loanId,
        customerId: selectedLoan?.customer.customerId || editingPayment?.customerId,
        paymentDetails: {
          dueDate: data.dueDate,
          paidDate: data.paidDate,
          expectedAmount: Number(data.expectedAmount),
          paidAmount: Number(data.paidAmount),
          breakdown: {
            principalPortion: Number(data.principalPortion),
            interestPortion: Number(data.interestPortion),
            penaltyPortion: Number(data.penaltyPortion || 0),
            lateFeesPortion: Number(data.lateFeesPortion || 0),
            savingsFromEarlyPayment: Number(data.savingsFromEarlyPayment || 0)
          }
        },
        paymentMethod: {
          type: data.paymentMethodType,
          reference: data.reference,
          bankName: data.bankName,
          accountNumber: data.accountNumber
        },
        paymentType: data.paymentType,
        processedBy: currentUser?.id
      };
      
      if (editingPayment) {
        await paymentService.update(editingPayment._id, paymentData);
        showNotification('success', 'Payment updated successfully');
      } else {
        await paymentService.create(paymentData);
        showNotification('success', 'Payment created successfully');
      }
      handleModalClose();
      fetchPayments();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save payment';
      showNotification('error', errorMessage);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPayment(null);
    setSelectedLoan(null);
    setLoanSearch('');
    setLoanResults([]);
    reset();
  };

  const canWrite = hasPermission(currentUser, 'write');

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {totalCount} payments
          </p>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
                Error Loading Payments
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </div>
              <Button onClick={fetchPayments}>
                Retry
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              data={payments}
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
              entityName="payments"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingPayment ? 'Edit Payment' : 'Add Payment'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {!editingPayment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan *
                </label>
                {selectedLoan ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm">
                      {selectedLoan.loanId} - {selectedLoan.customer.firstName} {selectedLoan.customer.lastName}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedLoan(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="Search loan by ID or customer name..."
                      value={loanSearch}
                      onChange={(e) => setLoanSearch(e.target.value)}
                    />
                    {loanResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loanResults.map((loan) => (
                          <button
                            key={loan.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setLoanSearch('');
                              setLoanResults([]);
                            }}
                          >
                            <div className="text-sm font-medium">
                              {loan.loanId} - {loan.customer.firstName} {loan.customer.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ₹{loan.principalAmount.toLocaleString()} • {loan.status}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="datetime-local"
                required
                {...register('dueDate', { required: 'Due Date is required' })}
                error={errors.dueDate?.message}
              />
              <Input
                label="Paid Date"
                type="datetime-local"
                {...register('paidDate')}
              />
              <Input
                label="Expected Amount"
                type="number"
                required
                {...register('expectedAmount', { required: 'Expected Amount is required' })}
                error={errors.expectedAmount?.message}
              />
              <Input
                label="Paid Amount"
                type="number"
                required
                {...register('paidAmount', { required: 'Paid Amount is required' })}
                error={errors.paidAmount?.message}
              />
              <Input
                label="Principal Portion"
                type="number"
                required
                {...register('principalPortion', { required: 'Principal Portion is required' })}
                error={errors.principalPortion?.message}
              />
              <Input
                label="Interest Portion"
                type="number"
                required
                {...register('interestPortion', { required: 'Interest Portion is required' })}
                error={errors.interestPortion?.message}
              />
              <Input
                label="Penalty Portion"
                type="number"
                {...register('penaltyPortion')}
              />
              <Input
                label="Late Fees Portion"
                type="number"
                {...register('lateFeesPortion')}
              />
              <Select
                label="Payment Method"
                required
                options={[
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'UPI', label: 'UPI' },
                  { value: 'CHEQUE', label: 'Cheque' }
                ]}
                {...register('paymentMethodType', { required: 'Payment Method is required' })}
                error={errors.paymentMethodType?.message}
              />
              <Input
                label="Reference"
                required
                {...register('reference', { required: 'Reference is required' })}
                error={errors.reference?.message}
              />
              <Input
                label="Bank Name"
                {...register('bankName')}
              />
              <Input
                label="Account Number"
                {...register('accountNumber')}
              />
              <Select
                label="Payment Type"
                required
                options={[
                  { value: 'FULL_SETTLEMENT', label: 'Full Settlement' },
                  { value: 'REGULAR', label: 'Regular' },
                  { value: 'PARTIAL', label: 'Partial' }
                ]}
                {...register('paymentType', { required: 'Payment Type is required' })}
                error={errors.paymentType?.message}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPayment ? 'Update' : 'Create'}
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
          <p>Are you sure you want to delete payment "{deleteConfirm?.paymentId}"?</p>
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

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </Layout>
  );
};