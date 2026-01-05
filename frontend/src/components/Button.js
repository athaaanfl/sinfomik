// frontend/src/components/Button.js
import React from 'react';

/**
 * Komponen Button modern dengan berbagai varian
 * @param {string} variant - Varian tombol: 'primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'ghost'
 * @param {string} size - Ukuran tombol: 'sm', 'md', 'lg'
 * @param {boolean} fullWidth - Apakah tombol full width
 * @param {boolean} disabled - Apakah tombol disabled
 * @param {boolean} loading - Apakah tombol dalam state loading
 * @param {string} icon - Nama icon FontAwesome (tanpa 'fas fa-')
 * @param {string} iconPosition - Posisi icon: 'left' atau 'right'
 * @param {function} onClick - Handler click
 * @param {string} type - Type HTML button: 'button', 'submit', 'reset'
 * @param {string} className - Class tambahan
 * @param {node} children - Konten tombol
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  children,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-indigo-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-500 shadow-md hover:shadow-lg',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-md hover:shadow-lg',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-md hover:shadow-lg',
    warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500 shadow-md hover:shadow-lg',
    outline: 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Combine classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <i className={`fas fa-${icon} ${children ? 'mr-2' : ''}`}></i>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <i className={`fas fa-${icon} ${children ? 'ml-2' : ''}`}></i>
      )}
    </button>
  );
};

export default Button;
