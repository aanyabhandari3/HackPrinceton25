// IBM Carbon Design System Color Palette
export const COLORS = {
  // Gray Scale
  gray100: '#161616', // Darkest - sidebar background
  gray90: '#262626',  // Hover states
  gray80: '#393939',  // Active states
  gray70: '#525252',  // Secondary text
  gray60: '#6f6f6f',
  gray50: '#8d8d8d',  // Tertiary text, icons
  gray40: '#a8a8a8',
  gray30: '#c6c6c6',  // Light text
  gray20: '#e0e0e0',  // Borders
  gray10: '#f4f4f4',  // Light backgrounds
  white: '#ffffff',
  
  // Primary Blue
  blue70: '#0353e9',  // Hover
  blue60: '#0f62fe',  // Primary
  blue50: '#4589ff',
  blue40: '#78a9ff',
  blue30: '#a6c8ff',
  blue20: '#d0e2ff',
  blue10: '#edf5ff',
  
  // Status Colors
  red60: '#da1e28',   // Danger/Error
  red50: '#fa4d56',
  orange50: '#ff832b', // Warning
  green50: '#24a148',  // Success
  green40: '#42be65',
  purple60: '#8a3ffc', // Accent
  purple50: '#a56eff',
}

// Typography
export const FONTS = {
  primary: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  mono: "'IBM Plex Mono', 'Courier New', monospace",
}

// Spacing
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
}

// Border Radius
export const RADIUS = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
}

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
}

// Z-Index
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}
