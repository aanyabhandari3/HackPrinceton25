import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white border border-transparent hover:bg-blue-700',
    secondary: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-800 border border-transparent hover:bg-gray-100',
    danger: 'bg-red-600 text-white border border-transparent hover:bg-red-700',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={16} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={16} />}
    </button>
  )
}

export default Button
