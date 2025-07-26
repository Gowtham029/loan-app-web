import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Notification } from '@/components/UI/Notification';
import { useNotification } from '@/hooks/useNotification';
import { customerService } from '@/services/customerService';
import { Customer, TableColumn } from '@/types';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Customer>();

  const columns: TableColumn[] = [
    { key: 'customerId', label: 'Customer ID', sortable: true },
    { key: 'fullName', label: 'Full Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobileNumber', label: 'Mobile', sortable: true },
    { key: 'pan', label: 'PAN', sortable: true },
    { 
      key: 'createdAt', 
      label: 'Created At', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getAll(currentPage, 10, searchValue);
      setCustomers(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      showNotification('error', 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchValue]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    reset(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setDeleteConfirm(customer);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await customerService.delete(deleteConfirm.id);
      showNotification('success', 'Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      showNotification('error', 'Failed to delete customer');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onSubmit = async (data: Customer) => {
    try {
      if (editingCustomer) {
        await customerService.update(editingCustomer.id, data);
        showNotification('success', 'Customer updated successfully');
      } else {
        await customerService.create(data);
        showNotification('success', 'Customer created successfully');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      reset();
      fetchCustomers();
    } catch (error) {
      showNotification('error', 'Failed to save customer');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            Add Customer
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Table
            columns={columns}
            data={customers}
            loading={loading}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer ID"
              required
              {...register('customerId', { required: 'Customer ID is required' })}
              error={errors.customerId?.message}
            />
            <Input
              label="Full Name"
              required
              {...register('fullName', { required: 'Full Name is required' })}
              error={errors.fullName?.message}
            />
            <Input
              label="Email"
              type="email"
              required
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <Input
              label="Mobile Number"
              required
              {...register('mobileNumber', { required: 'Mobile Number is required' })}
              error={errors.mobileNumber?.message}
            />
            <Input
              label="PAN"
              required
              {...register('pan', { required: 'PAN is required' })}
              error={errors.pan?.message}
            />
            <Input
              label="Aadhaar"
              required
              {...register('aadhaar', { required: 'Aadhaar is required' })}
              error={errors.aadhaar?.message}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingCustomer ? 'Update' : 'Create'}
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
          <p>Are you sure you want to delete customer "{deleteConfirm?.fullName}"?</p>
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