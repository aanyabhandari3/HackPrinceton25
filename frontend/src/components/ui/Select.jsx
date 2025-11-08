import React from 'react'
import { COLORS } from '../../constants/theme.js'

const Select = ({ 
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  ...props 
}) => {
  const selectStyles = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    backgroundColor: COLORS.gray10,
    border: `1px solid ${COLORS.gray50}`,
    borderBottom: `1px solid ${COLORS.gray50}`,
    color: COLORS.gray100,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }

  return (
    <div className={className}>
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={selectStyles}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
