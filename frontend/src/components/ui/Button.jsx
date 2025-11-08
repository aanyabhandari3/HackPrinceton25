import React from 'react'
import { COLORS } from '../../constants/theme'

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
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: 'none',
    outline: 'none',
  }

  const variants = {
    primary: {
      backgroundColor: COLORS.blue60,
      color: COLORS.white,
      ':hover': { backgroundColor: COLORS.blue70 },
    },
    secondary: {
      backgroundColor: COLORS.white,
      color: COLORS.gray100,
      border: `1px solid ${COLORS.gray50}`,
      ':hover': { backgroundColor: COLORS.gray10 },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.gray100,
      ':hover': { backgroundColor: COLORS.gray10 },
    },
    danger: {
      backgroundColor: COLORS.red60,
      color: COLORS.white,
      ':hover': { backgroundColor: COLORS.red50 },
    },
  }

  const sizes = {
    sm: {
      padding: '0.375rem 0.75rem',
      fontSize: '0.875rem',
    },
    md: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
    },
    lg: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
    },
  }

  const variantStyle = variants[variant] || variants.primary
  const sizeStyle = sizes[size] || sizes.md

  const handleMouseEnter = (e) => {
    if (!disabled && variantStyle[':hover']) {
      Object.assign(e.currentTarget.style, variantStyle[':hover'])
    }
  }

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.currentTarget.style.backgroundColor = variantStyle.backgroundColor
    }
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...baseStyles,
        ...variantStyle,
        ...sizeStyle,
      }}
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
