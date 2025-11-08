import React from 'react'
import { COLORS } from '../../constants/theme.js'

const Card = ({ 
  children, 
  title,
  subtitle,
  headerAction,
  padding = 'md',
  hoverable = false,
  className = '',
  ...props 
}) => {
  const paddingMap = {
    none: '0',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
  }

  const cardStyles = {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.gray20}`,
    transition: hoverable ? 'box-shadow 0.2s' : 'none',
  }

  return (
    <div
      className={className}
      style={cardStyles}
      onMouseEnter={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable) {
          e.currentTarget.style.boxShadow = 'none'
        }
      }}
      {...props}
    >
      {(title || headerAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: paddingMap[padding],
            borderBottom: `1px solid ${COLORS.gray20}`,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: COLORS.gray100,
                  margin: 0,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: COLORS.gray70,
                  margin: '0.25rem 0 0 0',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={{ padding: paddingMap[padding] }}>{children}</div>
    </div>
  )
}

export default Card
