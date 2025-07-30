import React from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
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
            placeholder="Search customers..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {totalCount} total customers
        </div>
      </div>

      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400',
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
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
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
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map((column) => (
                    <td key={column.key} className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 break-words max-w-0">
                      <div className="truncate" title={column.render ? column.render(row[column.key], row) : row[column.key]}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-3 sm:px-6 py-4 text-sm space-x-1 sm:space-x-2">
                      {onEdit && (
                        <Button size="sm" onClick={() => onEdit(row)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="danger" onClick={() => onDelete(row)}>
                          Delete
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
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