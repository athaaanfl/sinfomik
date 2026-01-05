// frontend/src/components/StatusMessage.js
import React, { useEffect } from 'react';

/**
 * Komponen pesan status yang konsisten
 */
const StatusMessage = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  message,
  onClose = null,
  autoClose = true,
  duration = 5000 
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`message ${type}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <i className={`fas ${icons[type]}`}></i>
          <span>{message}</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
