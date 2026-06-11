// src/utils/theme.js
export const COLORS = {
  primary: '#c41e3a',       // brand red
  primaryDark: '#9e1830',
  primaryLight: '#e8334d',
  background: '#0f0f0f',
  surface: '#1a1a1a',
  surfaceElevated: '#242424',
  border: '#2e2e2e',
  text: '#f0f0f0',
  textSecondary: '#9a9a9a',
  textMuted: '#5a5a5a',
  white: '#ffffff',
  black: '#000000',
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  breaking: '#ff3b3b',
  video: '#6c5ce7',
  overlay: 'rgba(0,0,0,0.6)',
  overlayDark: 'rgba(0,0,0,0.8)',
};

export const FONTS = {
  // Display — strong, editorial
  display: 'serif',
  // Body — clean and readable
  body: 'System',
  // Hindi/Bengali support
  devanagari: 'System',
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  padding: 16,
  paddingLg: 24,
  radius: 8,
  radiusLg: 14,
  radiusFull: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
};
