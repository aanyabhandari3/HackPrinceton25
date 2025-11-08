import React from 'react'
import { COLORS } from '../../constants/theme'

const Tabs = ({ tabs = [], activeTab, onTabChange, className = '' }) => {
  return (
    <div
      className={className}
      style={{ borderBottom: `1px solid ${COLORS.gray20}` }}
    >
      <nav style={{ display: 'flex', gap: '2rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id || tab}
            onClick={() => onTabChange(tab.id || tab)}
            style={{
              padding: '0.75rem 0.25rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              borderBottom: '2px solid',
              borderBottomColor:
                (tab.id || tab) === activeTab ? COLORS.blue60 : 'transparent',
              backgroundColor: 'transparent',
              color:
                (tab.id || tab) === activeTab ? COLORS.blue60 : COLORS.gray70,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if ((tab.id || tab) !== activeTab) {
                e.currentTarget.style.color = COLORS.gray100
              }
            }}
            onMouseLeave={(e) => {
              if ((tab.id || tab) !== activeTab) {
                e.currentTarget.style.color = COLORS.gray70
              }
            }}
          >
            {tab.label || tab}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Tabs
