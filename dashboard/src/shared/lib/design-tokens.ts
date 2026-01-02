/**
 * Design System Tokens
 * Centralized design values for consistent UI
 */

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    elevated: '#1C2128',
  },
  // Borders
  border: {
    DEFAULT: '#30363D',
    muted: '#21262D',
    accent: '#58A6FF',
  },
  // Text
  text: {
    primary: '#F0F6FC',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    muted: '#484F58',
  },
  // Semantic colors
  success: '#22C55E',
  error: '#F85149',
  warning: '#F59E0B',
  info: '#58A6FF',
  // Severity colors
  severity: {
    critical: '#F85149',
    high: '#F85149',
    medium: '#F59E0B',
    low: '#58A6FF',
    info: '#6E7681',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['IBM Plex Mono', 'Fira Code', 'ui-monospace', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const;

