// frontend/src/components/LoadingSpinner.js
import React from 'react';

/**
 * Loading spinner konsisten
 */
const LoadingSpinner = ({ 
  size = 'md', // 'sm', 'md', 'lg'
  text = 'Memuat data...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const content = (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 mb-4`}></div>
      {text && <p className="text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-16">
      {content}
    </div>
  );
};

export default LoadingSpinner;
