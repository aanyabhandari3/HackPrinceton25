import React from 'react'
import { COLORS } from '../../constants/theme'

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  label,
  error,
  disabled = false,
  className = '',
  ...props 
}) => {
  const inputStyles = {
    width: '100%',
    padding: Icon ? '0.5rem 0.75rem 0.5rem 2.5rem' : '0.5rem 0.75rem',
    fontSize: '0.875rem',
    backgroundColor: COLORS.gray10,
    border: `1px solid transparent`,
    borderBottom: `1px solid ${error ? COLORS.red60 : COLORS.gray50}`,
    borderRadius: '0',
    color: COLORS.gray100,
    outline: 'none',
    transition: 'all 0.2s',
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: '500',
            color: COLORS.gray70,
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: COLORS.gray70,
            }}
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={inputStyles}
          onFocus={(e) => {
            e.target.style.backgroundColor = COLORS.white
            e.target.style.borderBottom = `2px solid ${COLORS.blue60}`
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = COLORS.gray10
            e.target.style.borderBottom = `1px solid ${error ? COLORS.red60 : COLORS.gray50}`
          }}
          {...props}
        />
      </div>
      {error && (
        <p
          style={{
            fontSize: '0.75rem',
            color: COLORS.red60,
            marginTop: '0.25rem',
            margin: '0.25rem 0 0 0',
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
