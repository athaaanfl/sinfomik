// frontend/src/components/PageHeader.js
import React from 'react';

/**
 * Header standar untuk setiap modul
 */
const PageHeader = ({ 
  icon, 
  title, 
  subtitle = null, 
  badge = null,
  action = null 
}) => {
  return (
    <div className="card-header">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="card-title">
            <i className={`fas fa-${icon} text-indigo-600`}></i>
            {title}
            {badge && (
              <span className="ml-3 text-sm font-medium bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                {badge}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-2 text-sm">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
