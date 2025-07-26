import React, { useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { TableColumn } from '@/types';

export const Capital: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const columns: TableColumn[] = [
    { key: 'transactionId', label: 'Transaction ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
  ];

  const mockData = [
    { transactionId: 'CAP001', type: 'Investment', amount: '₹1,000,000', date: '2024-01-15', description: 'Initial Capital' },
    { transactionId: 'CAP002', type: 'Withdrawal', amount: '₹500,000', date: '2024-01-20', description: 'Loan Disbursement' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Capital</h1>
        
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