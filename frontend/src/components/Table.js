// frontend/src/components/Table.js
import React, { useState, useMemo } from 'react';

/**
 * Komponen Table modern dengan fitur sorting dan styling yang baik
 * @param {array} columns - Array kolom: [{ key: 'id', label: 'ID', sortable: true, render: (value, row) => ... }]
 * @param {array} data - Array data
 * @param {boolean} striped - Zebra striping
 * @param {boolean} hoverable - Hover effect
 * @param {boolean} bordered - Border styling
 * @param {string} size - Ukuran: 'sm', 'md', 'lg'
 * @param {string} className - Class tambahan
 * @param {function} onRowClick - Handler ketika row diklik
 * @param {node} emptyMessage - Pesan ketika data kosong
 */
const Table = ({
  columns = [],
  data = [],
  striped = true,
  hoverable = true,
  bordered = false,
  size = 'md',
  className = '',
  onRowClick = null,
  emptyMessage = 'Tidak ada data tersedia',
  actions = null, // Function to render action buttons per row
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc'
        ? aVal > bVal ? 1 : -1
        : bVal > aVal ? 1 : -1;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const cellPaddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <div className={`overflow-x-auto rounded-lg shadow-sm ${className}`}>
      <table className={`min-w-full divide-y divide-gray-200 ${sizeClasses[size]}`}>
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={`
                  ${cellPaddingClasses[size]}
                  text-left font-semibold text-gray-700 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-200 select-none' : ''}
                  ${bordered ? 'border-r border-gray-300' : ''}
                  transition-colors duration-150
                `}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="ml-1">
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? (
                          <i className="fas fa-sort-up text-indigo-600"></i>
                        ) : (
                          <i className="fas fa-sort-down text-indigo-600"></i>
                        )
                      ) : (
                        <i className="fas fa-sort text-gray-400"></i>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && (
              <th className={`${cellPaddingClasses[size]} text-right font-semibold text-gray-700 uppercase tracking-wider`}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className={`${cellPaddingClasses[size]} text-center text-gray-500`}
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                  ${hoverable ? 'hover:bg-indigo-50 transition-colors duration-150' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${cellPaddingClasses[size]}
                      text-gray-900
                      ${bordered ? 'border-r border-gray-200' : ''}
                    `}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className={`${cellPaddingClasses[size]} text-right whitespace-nowrap`}>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
