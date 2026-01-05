// frontend/src/components/ModuleContainer.js
import React from 'react';

/**
 * Container wrapper untuk semua modul dengan styling konsisten
 */
const ModuleContainer = ({ children, className = '' }) => {
  return (
    <div className={`animate-fadeIn ${className}`}>
      <div className="card">
        {children}
      </div>
    </div>
  );
};

export default ModuleContainer;
