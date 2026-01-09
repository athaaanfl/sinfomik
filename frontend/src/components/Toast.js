// frontend/src/components/Toast.js
import React, { useEffect } from 'react';

/**
 * Toast notification component - appears as popup from top-right
 */
const Toast = ({ 
  id,
  type = 'info', // 'success', 'error', 'warning', 'info'
  title,
  message,
  onClose,
  duration = 5000,
  autoClose = true
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, id, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'fa-check-circle text-green-600',
      text: 'text-green-800',
      title: 'text-green-900'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'fa-exclamation-circle text-red-600',
      text: 'text-red-800',
      title: 'text-red-900'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'fa-exclamation-triangle text-yellow-600',
      text: 'text-yellow-800',
      title: 'text-yellow-900'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'fa-info-circle text-blue-600',
      text: 'text-blue-800',
      title: 'text-blue-900'
    }
  };

  const style = styles[type] || styles.info;

  return (
    <div 
      className={`toast-item ${style.bg} border-l-4 rounded-lg shadow-lg p-4 mb-3 animate-slideInRight`}
      style={{ minWidth: '320px', maxWidth: '480px' }}
    >
      <div className="flex items-start gap-3">
        <i className={`fas ${style.icon} text-xl mt-1`}></i>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${style.title} mb-1`}>
              {title}
            </h4>
          )}
          <p className={`${style.text} text-sm break-words`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${style.text} opacity-70 hover:opacity-100 transition-opacity flex-shrink-0`}
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;
