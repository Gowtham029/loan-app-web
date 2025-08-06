import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { Select } from '@/components/UI/Select';
import { Tabs } from '@/components/UI/Tabs';
import { Notification } from '@/components/UI/Notification';
import { useNotification } from '@/hooks/useNotification';
import { customerService } from '@/services/customerService';
import { Customer, TableColumn } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/utils/permissions';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);
  const [nationalitySearch, setNationalitySearch] = useState('India');
  const [showNationalityOptions, setShowNationalityOptions] = useState(false);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();
  const { user: currentUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Customer>();

  const monthlyIncome = watch('employmentDetails.monthlyIncome');
  const formData = watch();
  
  useEffect(() => {
    if (monthlyIncome) {
      setValue('employmentDetails.annualIncome', Number(monthlyIncome) * 12);
    }
  }, [monthlyIncome, setValue]);

  useEffect(() => {
    if (editingCustomer && originalCustomer && formData) {
      // Check basic form fields
      const basicFields = ['firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'email', 'customerNotes', 'creditScore', 'kycStatus', 'accountStatus'];
      const hasBasicChanges = basicFields.some(key => {
        const current = formData[key] || '';
        const original = originalCustomer[key] || '';
        return String(current).trim() !== String(original).trim();
      });
      
      // Check phone numbers
      const currentPhone = formData.phoneNumber || '';
      const originalPhone = originalCustomer.phoneNumber?.replace('+91', '') || '';
      const hasPhoneChange = currentPhone !== originalPhone;
      
      const currentAltPhone = formData.alternatePhoneNumber || '';
      const originalAltPhone = originalCustomer.alternatePhoneNumber?.replace('+91', '') || '';
      const hasAltPhoneChange = currentAltPhone !== originalAltPhone;
      
      // Check nationality
      const hasNationalityChange = nationalitySearch !== (originalCustomer.nationality || 'India');
      
      // Check photo
      const hasPhotoChanges = profilePhoto !== originalCustomer.photoUrl;
      
      // Check documents
      const originalDocs = originalCustomer.identificationDocuments || [];
      const hasDocChanges = documents.length !== originalDocs.length || 
        JSON.stringify(documents.map(d => ({...d, id: undefined}))) !== JSON.stringify(originalDocs);
      
      // Check address and employment (nested objects)
      const hasAddressChanges = JSON.stringify(formData.currentAddress || {}) !== JSON.stringify(originalCustomer.currentAddress || {}) ||
        JSON.stringify(formData.permanentAddress || {}) !== JSON.stringify(originalCustomer.permanentAddress || {});
      
      const hasEmploymentChanges = JSON.stringify(formData.employmentDetails || {}) !== JSON.stringify(originalCustomer.employmentDetails || {});
      
      setHasChanges(hasBasicChanges || hasPhoneChange || hasAltPhoneChange || hasNationalityChange || hasPhotoChanges || hasDocChanges || hasAddressChanges || hasEmploymentChanges);
    } else {
      setHasChanges(false);
    }
  }, [formData, originalCustomer, editingCustomer, profilePhoto, documents, nationalitySearch]);

  const watchedFields = watch(['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 'maritalStatus', 'nationality']);
  const isFormValid = watchedFields.every(field => field && field.toString().trim() !== '');

  const countries = [
    'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Brazil',
    'Russia', 'South Africa', 'Mexico', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland',
    'Switzerland', 'Austria', 'Belgium', 'Portugal', 'Greece', 'Turkey', 'Egypt', 'Nigeria', 'Kenya', 'Ghana',
    'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Ethiopia', 'Uganda', 'Tanzania', 'Zimbabwe', 'Botswana',
    'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia', 'Ecuador', 'Guyana'
  ];



  const columns: TableColumn[] = [
    { 
      key: 'photo', 
      label: 'Photo', 
      render: (value, row) => (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-medium text-sm">
          {row.photoUrl ? (
            <img src={row.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            `${row.firstName?.charAt(0) || ''}${row.lastName?.charAt(0) || ''}`
          )}
        </div>
      )
    },
    { key: 'customerId', label: 'Customer ID', sortable: true },
    { 
      key: 'firstName', 
      label: 'Full Name', 
      sortable: true,
      render: (value, row) => `${row.firstName} ${row.middleName || ''} ${row.lastName}`.trim()
    },
    { key: 'phoneNumber', label: 'Phone', sortable: true },
    { 
      key: 'verification', 
      label: 'Verification', 
      render: (value, row) => {
        const isVerified = row.identificationDocuments && row.identificationDocuments.length > 0;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isVerified 
              ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/20' 
              : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/20'
          }`}>
            {isVerified ? 'Verified' : 'Unverified'}
          </span>
        );
      }
    },
    { key: 'accountStatus', label: 'Status', sortable: true },
  ];

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await customerService.getAll(currentPage, 10, searchValue);
      setCustomers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch customers';
      setError(errorMessage);
      setCustomers([]);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.nationality-container')) {
        setShowNationalityOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (customer: Customer) => {
    if (!hasPermission(currentUser, 'write')) {
      showNotification('error', 'You do not have permission to edit customers');
      return;
    }
    setEditingCustomer(customer);
    setOriginalCustomer(customer);
    setDocuments(customer.identificationDocuments || []);
    setProfilePhoto(customer.photoUrl);
    setNationalitySearch(customer.nationality || 'India');
    
    // Fix DOB format for input field
    const customerWithFixedDOB = {
      ...customer,
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : ''
    };
    reset(customerWithFixedDOB);
    setIsModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    if (!hasPermission(currentUser, 'delete')) {
      showNotification('error', 'You do not have permission to delete customers');
      return;
    }
    setDeleteConfirm(customer);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await customerService.delete(deleteConfirm.customerId);
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
      const customerData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        nationality: nationalitySearch || 'India',
        maritalStatus: data.maritalStatus,
        phoneNumber: data.phoneNumber,
        kycStatus: data.kycStatus || 'Pending',
        accountStatus: data.accountStatus || 'Active',
        fatcaStatus: Boolean(data.fatcaStatus),
        pepStatus: Boolean(data.pepStatus),
        createdBy: currentUser?.username || 'admin'
      };

      // Only add fields with values
      if (data.email?.trim()) customerData.email = data.email;
      if (data.middleName?.trim()) customerData.middleName = data.middleName;
      if (data.alternatePhoneNumber?.trim()) customerData.alternatePhoneNumber = data.alternatePhoneNumber;
      if (profilePhoto) customerData.photoUrl = profilePhoto;
      if (data.customerNotes?.trim()) customerData.customerNotes = data.customerNotes;
      if (data.creditScore) customerData.creditScore = Number(data.creditScore);
      
      // Current Address - only add if has meaningful data
      if (data.currentAddress) {
        const currentAddr = Object.fromEntries(
          Object.entries(data.currentAddress).filter(([key, value]) => value && String(value).trim())
        );
        if (Object.keys(currentAddr).length > 0) customerData.currentAddress = currentAddr;
      }
      
      // Permanent Address - only add if has meaningful data
      if (data.permanentAddress) {
        const permanentAddr = Object.fromEntries(
          Object.entries(data.permanentAddress).filter(([key, value]) => value && String(value).trim())
        );
        if (Object.keys(permanentAddr).length > 0) customerData.permanentAddress = permanentAddr;
      }
      
      // Employment Details - only add if has meaningful data
      if (data.employmentDetails) {
        const employment = Object.fromEntries(
          Object.entries(data.employmentDetails).filter(([key, value]) => value && String(value).trim())
        );
        if (Object.keys(employment).length > 0) {
          customerData.employmentDetails = {
            ...employment,
            ...(employment.workExperience && { workExperience: Number(employment.workExperience) }),
            ...(employment.monthlyIncome && { monthlyIncome: Number(employment.monthlyIncome) }),
            ...(employment.annualIncome && { annualIncome: Number(employment.annualIncome) })
          };
        }
      }
      
      // Identification Documents - only add if has documents
      if (documents.length > 0) {
        customerData.identificationDocuments = documents.map(doc => {
          const { id, ...docWithoutId } = doc;
          return Object.fromEntries(
            Object.entries(docWithoutId).filter(([key, value]) => value && String(value).trim())
          );
        });
      }
      
      if (editingCustomer && originalCustomer) {
        // Only send modified fields
        const modifiedData: any = {};
        
        // Compare basic fields
        Object.keys(customerData).forEach(key => {
          if (key === 'fatcaStatus' || key === 'pepStatus' || key === 'createdBy') return;
          
          if (key === 'phoneNumber' || key === 'alternatePhoneNumber') {
            const originalPhone = key === 'phoneNumber' ? originalCustomer.phoneNumber : originalCustomer.alternatePhoneNumber;
            if (customerData[key] !== originalPhone) {
              modifiedData[key] = customerData[key];
            }
          } else if (JSON.stringify(customerData[key]) !== JSON.stringify(originalCustomer[key])) {
            modifiedData[key] = customerData[key];
          }
        });
        
        if (Object.keys(modifiedData).length > 0) {
          await customerService.update(editingCustomer.customerId, modifiedData);
          showNotification('success', 'Customer updated successfully');
        } else {
          showNotification('info', 'No changes detected');
        }
      } else {
        await customerService.create(customerData);
        showNotification('success', 'Customer created successfully');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setDocuments([]);
      setProfilePhoto(undefined);
      reset();
      fetchCustomers();
    } catch (error) {
      showNotification('error', 'Failed to save customer');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setOriginalCustomer(null);
    setHasChanges(false);
    setDocuments([]);
    setShowDocForm(false);
    setProfilePhoto(undefined);
    setNationalitySearch('India');
    setShowNationalityOptions(false);
    reset();
  };

  const addDocument = (docData: any) => {
    setDocuments([...documents, { ...docData, id: Date.now() }]);
    setShowDocForm(false);
  };

  const removeDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const photoUrl = URL.createObjectURL(file);
      setProfilePhoto(photoUrl);
    }
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: {totalCount} customers
          </p>
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
                Error Loading Customers
              </div>
              <div className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </div>
              <Button onClick={fetchCustomers}>
                Retry
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              data={customers}
              loading={loading}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onEdit={hasPermission(currentUser, 'write') ? handleEdit : undefined}
              onDelete={hasPermission(currentUser, 'delete') ? handleDelete : undefined}
              onAdd={hasPermission(currentUser, 'write') ? () => setIsModalOpen(true) : undefined}
              entityName="customers"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="xl"
      >
        <div>
          <Tabs
            tabs={[
              {
                id: 'profile',
                label: 'Profile *',
                content: (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-sm">Photo</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photoUpload"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => document.getElementById('photoUpload')?.click()}
                        >
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        required
                        {...register('firstName', { required: 'First Name is required' })}
                        error={errors.firstName?.message}
                      />
                      <Input
                        label="Middle Name"
                        {...register('middleName')}
                      />
                      <Input
                        label="Last Name"
                        required
                        {...register('lastName', { required: 'Last Name is required' })}
                        error={errors.lastName?.message}
                      />
                      <Input
                        label="Email"
                        type="email"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                          <input
                            type="tel"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter 10-digit mobile number"
                            {...register('phoneNumber', { 
                              required: 'Phone Number is required',
                              pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: 'Enter valid 10-digit Indian mobile number'
                              }
                            })}
                          />
                        </div>
                        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
                      </div>
                      <Input
                        label="Date of Birth"
                        type="date"
                        required
                        {...register('dateOfBirth', { required: 'Date of Birth is required' })}
                        error={errors.dateOfBirth?.message}
                      />
                      <Select
                        label="Gender"
                        required
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                          { value: 'Other', label: 'Other' }
                        ]}
                        {...register('gender', { required: 'Gender is required' })}
                        error={errors.gender?.message}
                      />
                      <Select
                        label="Marital Status"
                        required
                        options={[
                          { value: 'Single', label: 'Single' },
                          { value: 'Married', label: 'Married' },
                          { value: 'Divorced', label: 'Divorced' },
                          { value: 'Widowed', label: 'Widowed' }
                        ]}
                        {...register('maritalStatus', { required: 'Marital Status is required' })}
                        error={errors.maritalStatus?.message}
                      />
                      <div className="relative nationality-container">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nationality <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={nationalitySearch}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNationalitySearch(value);
                            setShowNationalityOptions(value.length > 0);
                          }}
                          onFocus={() => setShowNationalityOptions(nationalitySearch.length > 0)}
                          placeholder="Search nationality..."
                          {...register('nationality', { required: 'Nationality is required' })}
                        />
                        {showNationalityOptions && nationalitySearch.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {countries
                              .filter(country => country.toLowerCase().includes(nationalitySearch.toLowerCase()))
                              .slice(0, 10)
                              .map((country) => (
                                <button
                                  key={country}
                                  type="button"
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                  onClick={() => {
                                    setNationalitySearch(country);
                                    setShowNationalityOptions(false);
                                  }}
                                >
                                  {country}
                                </button>
                              ))
                            }
                          </div>
                        )}
                        {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Alternate Phone
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+91</span>
                          <input
                            type="tel"
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Enter 10-digit mobile number"
                            {...register('alternatePhoneNumber', {
                              pattern: {
                                value: /^[6-9]\d{9}$/,
                                message: 'Enter valid 10-digit Indian mobile number'
                              }
                            })}
                          />
                        </div>
                        {errors.alternatePhoneNumber && <p className="mt-1 text-sm text-red-600">{errors.alternatePhoneNumber.message}</p>}
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'address',
                label: 'Address Details (Optional)',
                content: (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Street"
                      {...register('currentAddress.street')}
                    />
                    <Input
                      label="City"
                      {...register('currentAddress.city')}
                    />
                    <Input
                      label="State"
                      {...register('currentAddress.state')}
                    />
                    <Input
                      label="Postal Code"
                      {...register('currentAddress.postalCode')}
                    />
                    <Input
                      label="Country"
                      {...register('currentAddress.country')}
                    />
                  </div>
                )
              },
              {
                id: 'employment',
                label: 'Employment Details (Optional)',
                content: (
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Employment Status"
                      options={[
                        { value: 'Employed', label: 'Employed' },
                        { value: 'Self-Employed', label: 'Self-Employed' },
                        { value: 'Unemployed', label: 'Unemployed' },
                        { value: 'Retired', label: 'Retired' }
                      ]}
                      {...register('employmentDetails.employmentStatus')}
                    />
                    <Input
                      label="Employer Name"
                      {...register('employmentDetails.employerName')}
                    />
                    <Input
                      label="Designation"
                      {...register('employmentDetails.designation')}
                    />
                    <Input
                      label="Work Experience (years)"
                      type="number"
                      {...register('employmentDetails.workExperience')}
                    />
                    <Input
                      label="Monthly Income"
                      type="number"
                      {...register('employmentDetails.monthlyIncome')}
                    />
                    <Input
                      label="Annual Income"
                      type="number"
                      disabled
                      {...register('employmentDetails.annualIncome')}
                      className="bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                    />
                  </div>
                )
              },
              {
                id: 'documents',
                label: 'Identification Documents (Optional)',
                content: (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Number</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Authority</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                          {documents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                No documents added yet
                              </td>
                            </tr>
                          ) : (
                            documents.map((doc) => (
                              <tr key={doc.id}>
                                <td className="px-4 py-2 text-sm">{doc.documentType}</td>
                                <td className="px-4 py-2 text-sm">{doc.documentNumber}</td>
                                <td className="px-4 py-2 text-sm">{doc.issuingAuthority}</td>
                                <td className="px-4 py-2 text-sm">{doc.expiryDate}</td>
                                <td className="px-4 py-2 text-sm">
                                  {doc.documentUrl && (
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => window.open(doc.documentUrl, '_blank')}
                                    >
                                      View
                                    </Button>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm space-x-1">
                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeDocument(doc.id)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDocForm(true)}
                    >
                      Add Document
                    </Button>
                  </div>
                )
              }
            ]}
          />
          
          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={editingCustomer ? !hasChanges : !isFormValid}
              onClick={handleSubmit(onSubmit)}
            >
              {editingCustomer ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete customer "{deleteConfirm?.firstName} {deleteConfirm?.lastName}"?</p>
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
        isOpen={showDocForm}
        onClose={() => setShowDocForm(false)}
        title="Add Document"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Document Type"
              options={[
                { value: "Driver's License", label: "Driver's License" },
                { value: 'Passport', label: 'Passport' },
                { value: 'National ID', label: 'National ID' },
                { value: 'Voter ID', label: 'Voter ID' }
              ]}
              id="docType"
            />
            <Input label="Document Number" id="docNumber" />
            <Input label="Issuing Authority" id="docAuthority" />
            <Input label="Issue Date" type="date" id="issueDate" />
            <Input label="Expiry Date" type="date" id="expiryDate" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Document
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                id="docFile"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDocForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const docType = (document.getElementById('docType') as HTMLSelectElement)?.value;
                const docNumber = (document.getElementById('docNumber') as HTMLInputElement)?.value;
                const docAuthority = (document.getElementById('docAuthority') as HTMLInputElement)?.value;
                const issueDate = (document.getElementById('issueDate') as HTMLInputElement)?.value;
                const expiryDate = (document.getElementById('expiryDate') as HTMLInputElement)?.value;
                const docFile = (document.getElementById('docFile') as HTMLInputElement)?.files?.[0];
                
                if (docType && docNumber && docAuthority) {
                  addDocument({
                    documentType: docType,
                    documentNumber: docNumber,
                    issuingAuthority: docAuthority,
                    issueDate,
                    expiryDate,
                    documentUrl: docFile ? URL.createObjectURL(docFile) : ''
                  });
                  // Clear form
                  (document.getElementById('docType') as HTMLSelectElement).value = '';
                  (document.getElementById('docNumber') as HTMLInputElement).value = '';
                  (document.getElementById('docAuthority') as HTMLInputElement).value = '';
                  (document.getElementById('issueDate') as HTMLInputElement).value = '';
                  (document.getElementById('expiryDate') as HTMLInputElement).value = '';
                  (document.getElementById('docFile') as HTMLInputElement).value = '';
                }
              }}
            >
              Add Document
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