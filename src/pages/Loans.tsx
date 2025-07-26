import React, { useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Table } from '@/components/UI/Table';
import { TableColumn } from '@/types';

export const Loans: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const columns: TableColumn[] = [
    { key: 'loanId', label: 'Loan ID', sortable: true },
    { key: 'customerId', label: 'Customer ID', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'startDate', label: 'Start Date', sortable: true },
  ];

  const mockData = [
    { loanId: 'LOAN001', customerId: 'CUST001', amount: '₹100,000', status: 'Active', startDate: '2024-01-01' },
    { loanId: 'LOAN002', customerId: 'CUST002', amount: '₹200,000', status: 'Pending', startDate: '2024-01-05' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loans</h1>
        
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