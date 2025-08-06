import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { AlertTriangle, TrendingUp, DollarSign, BarChart3, PieChart, Target, Users, Zap } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        
        {/* Key Metrics */}
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

        {/* Immediate Action Reports */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Immediate Action Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Overdue Analysis</h3>
              <p className="text-2xl font-bold text-red-600 mt-2">₹13,685</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Total outstanding per loan</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">Penalty Recovery</h3>
              <p className="text-2xl font-bold text-orange-600 mt-2">₹460</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Penalty collections</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">Collection Efficiency</h3>
              <p className="text-2xl font-bold text-yellow-600 mt-2">83.33%</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Principal recovery rate</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Cash Flow Forecast</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹2.4M</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Predicted incoming payments</p>
            </div>
          </div>
        </div>

        {/* Strategic Decision Reports */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strategic Decision Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-purple-500">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio at Risk (PAR)</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">12.5%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Industry standard risk metric</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interest Rate Optimization</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">18%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Annual vs market rates</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-indigo-500">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Term Preference Analysis</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-600 mt-2">1M vs 12M</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Loan demand comparison</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-pink-500">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-pink-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Segmentation</h3>
              </div>
              <p className="text-2xl font-bold text-pink-600 mt-2">4 Tiers</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Risk-based pricing strategies</p>
            </div>
          </div>
        </div>

        {/* Revenue Optimization Reports */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Optimization Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Penalty Income Analysis</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">₹960</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">₹500 late fees + ₹460 compound interest</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Early Payment Impact</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹1,250</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Interest savings from flexible terms</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Cross-selling Opportunities</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">156</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Based on payment behavior</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">Profitability by Loan Size</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600 mt-2">₹50K</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">Optimize loan ticket sizes</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};