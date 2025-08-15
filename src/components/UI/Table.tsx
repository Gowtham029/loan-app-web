import React from 'react';
import { ChevronUp, ChevronDown, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TableColumn } from '@/types';
import { Button } from './Button';
import { Input } from './Input';

interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  currentPage: number;
  totalPages: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onAdd?: () => void;
  onViewPayments?: (item: any) => void;
  entityName?: string;
  fixedHeight?: boolean;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading,
  searchValue,
  onSearchChange,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  totalCount = 0,
  onPageChange,
  onEdit,
  onDelete,
  onAdd,
  onViewPayments,
  entityName = 'items',
  fixedHeight = false,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={`Search ${entityName}...`}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {totalCount} total {entityName}
          </div>
          {onAdd && (
            <Button onClick={onAdd}>
              Add {entityName.slice(0, -1)}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className={cn("overflow-auto", fixedHeight ? "h-96" : "max-h-full")}>
          <table className="w-full table-auto">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300',
                    column.key === 'photo' ? 'text-center' : 'text-left',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete || onViewPayments) && (
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {columns.map((column) => (
                    <td key={column.key} className={cn(
                      'px-6 py-4 text-sm text-gray-900 dark:text-gray-100',
                      column.key === 'photo' ? 'text-center' : 'text-left'
                    )}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete || onViewPayments) && (
                    <td className="px-6 py-4 text-center">  
                      <div className="flex justify-center items-center space-x-3">
                        {onViewPayments && (
                          <button
                            onClick={() => onViewPayments(row)}
                            className="inline-flex items-center justify-center w-9 h-9 text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                            title="View Payments"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="inline-flex items-center justify-center w-9 h-9 text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="inline-flex items-center justify-center w-9 h-9 text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-1 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === 1 || totalPages <= 1}
              onClick={() => onPageChange(1)}
            >
              First
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === 1 || totalPages <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            
            {getPageNumbers().map((page) => (
              <Button
                key={page}
                size="sm"
                variant={currentPage === page ? "primary" : "secondary"}
                onClick={() => onPageChange(page)}
                className={currentPage === page ? "bg-blue-600 text-white" : ""}
              >
                {page}
              </Button>
            ))}
            
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages || totalPages <= 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={currentPage === totalPages || totalPages <= 1}
              onClick={() => onPageChange(totalPages)}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};