import React from 'react'
import { COLORS } from '../../constants/theme'

const StatCard = ({ 
  title, 
  value, 
  detail, 
  icon: Icon,
  status = 'neutral', // 'good', 'warning', 'danger', 'neutral'
  className = '',
}) => {
  const statusColors = {
    good: COLORS.green50,
    warning: COLORS.orange50,
    danger: COLORS.red60,
    neutral: COLORS.blue60,
  }

  const iconColor = statusColors[status] || statusColors.neutral

  return (
    <div
      className={className}
      style={{
        backgroundColor: COLORS.white,
        border: `1px solid ${COLORS.gray20}`,
        padding: '1rem',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: COLORS.gray70,
            margin: 0,
          }}
        >
          {title}
        </p>
        {Icon && <Icon size={20} style={{ color: iconColor }} />}
      </div>
      <p
        style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: COLORS.gray100,
          margin: '0 0 0.5rem 0',
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {detail && (
        <p
          style={{
            fontSize: '0.75rem',
            color: COLORS.gray70,
            margin: 0,
          }}
        >
          {detail}
        </p>
      )}
    </div>
  )
}

export default StatCard
