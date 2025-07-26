import React from 'react';
import { Layout } from '@/components/Layout/Layout';

export const Info: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Information</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Application Name</p>
                <p className="font-medium text-gray-900 dark:text-white">HexaBee Loan Management System</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Version</p>
                <p className="font-medium text-gray-900 dark:text-white">1.0.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Build Date</p>
                <p className="font-medium text-gray-900 dark:text-white">January 2024</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
                <p className="font-medium text-gray-900 dark:text-white">Development</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Frontend</p>
                <p className="font-medium text-gray-900 dark:text-white">React 18 + TypeScript</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Styling</p>
                <p className="font-medium text-gray-900 dark:text-white">Tailwind CSS</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Build Tool</p>
                <p className="font-medium text-gray-900 dark:text-white">Vite</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Package Manager</p>
                <p className="font-medium text-gray-900 dark:text-white">pnpm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Icons</p>
                <p className="font-medium text-gray-900 dark:text-white">Lucide React</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Forms</p>
                <p className="font-medium text-gray-900 dark:text-white">React Hook Form</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Customer Management with CRUD operations</li>
              <li>User Management with role-based access</li>
              <li>Authentication with JWT tokens</li>
              <li>Dark/Light theme support</li>
              <li>Responsive design</li>
              <li>Data tables with search, sort, and pagination</li>
              <li>Form validation with error handling</li>
              <li>Notification system</li>
              <li>Modal dialogs</li>
              <li>Enterprise-grade code structure</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};