// frontend/src/components/FormSection.js
import React from 'react';

/**
 * Section untuk form dengan styling konsisten
 */
const FormSection = ({ 
  title, 
  icon = 'plus',
  children, 
  variant = 'default' // 'default', 'success', 'info', 'warning'
}) => {
  const variantClasses = {
    default: 'from-gray-50 to-slate-50 border-gray-200',
    success: 'from-green-50 to-emerald-50 border-green-200',
    info: 'from-blue-50 to-indigo-50 border-blue-200',
    warning: 'from-yellow-50 to-amber-50 border-yellow-200',
  };

  const iconColors = {
    default: 'text-gray-600',
    success: 'text-green-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className={`mb-8 bg-gradient-to-r ${variantClasses[variant]} p-6 rounded-xl border-2 shadow-sm`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
        <i className={`fas fa-${icon} mr-2 ${iconColors[variant]}`}></i>
        {title}
      </h2>
      {children}
    </div>
  );
};

export default FormSection;
