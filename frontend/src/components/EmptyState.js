// frontend/src/components/EmptyState.js
import React from 'react';

/**
 * Tampilan konsisten ketika data kosong
 */
const EmptyState = ({ 
  icon = 'inbox',
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia saat ini.',
  action = null
}) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
        <i className={`fas fa-${icon} text-4xl text-gray-400`}></i>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
