import React, { useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { TableColumn } from '@/types';

export const Payments: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const columns: TableColumn[] = [
    { key: 'paymentId', label: 'Payment ID', sortable: true },
    { key: 'customerId', label: 'Customer ID', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const mockData = [
    { paymentId: 'PAY001', customerId: 'CUST001', amount: '₹10,000', status: 'Completed', date: '2024-01-15' },
    { paymentId: 'PAY002', customerId: 'CUST002', amount: '₹15,000', status: 'Pending', date: '2024-01-16' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <Table
            columns={columns}
            data={mockData}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>
  );
};