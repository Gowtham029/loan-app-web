import React from 'react';
import { Layout } from '@/components/Layout/Layout';

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Customers</h3>
            <p className="text-3xl font-bold text-primary-600 mt-2">1,234</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Loans</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">567</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Payments</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">₹12.5M</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Capital</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">₹50M</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};