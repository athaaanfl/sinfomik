// frontend/src/context/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 5000,
      autoClose: toast.autoClose !== false
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods
  const toast = {
    success: (message, title = 'Berhasil') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message, duration: 7000 }),
    warning: (message, title = 'Peringatan') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Informasi') => addToast({ type: 'info', title, message })
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      
      {/* Toast Container - Fixed position top-right */}
      <div 
        className="fixed top-4 right-4 z-[9999] pointer-events-none"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <div className="pointer-events-auto space-y-3">
          {toasts.map(t => (
            <Toast
              key={t.id}
              id={t.id}
              type={t.type}
              title={t.title}
              message={t.message}
              duration={t.duration}
              autoClose={t.autoClose}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
