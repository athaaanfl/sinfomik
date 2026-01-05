// frontend/src/components/ConfirmDialog.js
import React from 'react';
import Button from './Button';

/**
 * Modal konfirmasi standar untuk delete/action berbahaya
 */
const ConfirmDialog = ({ 
  isOpen,
  show,
  title = 'Konfirmasi',
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  variant = 'danger' // 'danger', 'warning', 'info'
}) => {
  // Support both isOpen and show props for flexibility
  const open = isOpen !== undefined ? isOpen : show;
  
  if (!open) return null;

  const iconClasses = {
    danger: 'fas fa-exclamation-triangle text-red-600 text-5xl',
    warning: 'fas fa-exclamation-circle text-yellow-600 text-5xl',
    info: 'fas fa-info-circle text-blue-600 text-5xl',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md animate-slideInUp">
        <div className="text-center mb-6">
          <div className="mb-4">
            <i className={iconClasses[variant]}></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
          <p className="text-gray-600 text-base leading-relaxed">{message}</p>
        </div>
        
        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={onCancel}
            fullWidth
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
