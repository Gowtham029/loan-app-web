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
import { userService } from '@/services/userService';
import { User, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const { notification, showNotification, hideNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<User>();

  const watchedFields = watch(['username', 'email', 'firstName', 'lastName', 'role']);
  const isFormValid = watchedFields.every(field => field && field.toString().trim() !== '');

  const columns: TableColumn[] = [
    { 
      key: 'photo', 
      label: 'Photo', 
      render: (value, row) => (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-medium text-sm">
          {row.profilePicture ? (
            <img src={row.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            `${row.firstName?.charAt(0) || ''}${row.lastName?.charAt(0) || ''}`
          )}
        </div>
      )
    },
    { 
      key: 'firstName', 
      label: 'Full Name', 
      sortable: true,
      render: (value, row) => `${row.firstName} ${row.lastName}`
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAll(currentPage, 10, searchValue);
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      setError(errorMessage);
      setUsers([]);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchValue]);

  const handleEdit = (user: User) => {
    if (!hasPermission(currentUser, 'write')) {
      showNotification('error', 'You do not have permission to edit users');
      return;
    }
    setEditingUser(user);
    reset(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (!hasPermission(currentUser, 'delete')) {
      showNotification('error', 'You do not have permission to delete users');
      return;
    }
    setDeleteConfirm(user);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await userService.delete(deleteConfirm.id);
      showNotification('success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      showNotification('error', 'Failed to delete user');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const onSubmit = async (data: User) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, data);
        showNotification('success', 'User updated successfully');
      } else {
        await userService.create(data);
        showNotification('success', 'User created successfully');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (error) {
      showNotification('error', 'Failed to save user');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const canWrite = hasPermission(currentUser, 'write');

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {totalCount} users
          </p>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
                Error Loading Users
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </div>
              <Button onClick={fetchUsers}>
                Retry
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              data={users}
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
              entityName="users"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingUser ? 'Edit User' : 'Add User'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              required
              {...register('username', { required: 'Username is required' })}
              error={errors.username?.message}
            />
            <Input
              label="Email"
              type="email"
              required
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <Input
              label="First Name"
              required
              {...register('firstName', { required: 'First Name is required' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              required
              {...register('lastName', { required: 'Last Name is required' })}
              error={errors.lastName?.message}
            />
            <Select
              label="Role"
              required
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'viewer', label: 'Viewer' }
              ]}
              {...register('role', { required: 'Role is required' })}
              error={errors.role?.message}
            />
            <Select
              label="Status"
              required
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              {...register('status', { required: 'Status is required' })}
              error={errors.status?.message}
            />
            <Input
              label="Phone Number"
              {...register('phoneNumber')}
            />
            <Input
              label="Department"
              {...register('department')}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!editingUser && !isFormValid}
            >
              {editingUser ? 'Update' : 'Create'}
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
          <p>Are you sure you want to delete user "{deleteConfirm?.username}"?</p>
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