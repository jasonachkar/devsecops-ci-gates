/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0D1117',
          secondary: '#161B22',
          tertiary: '#21262D',
          elevated: '#1C2128',
        },
        border: {
          DEFAULT: '#30363D',
          muted: '#21262D',
          accent: '#58A6FF',
        },
        text: {
          primary: '#F0F6FC',
          secondary: '#8B949E',
          tertiary: '#6E7681',
          muted: '#484F58',
        },
        success: '#22C55E',
        error: '#F85149',
        warning: '#F59E0B',
        info: '#58A6FF',
        severity: {
          critical: '#F85149',
          high: '#F85149',
          medium: '#F59E0B',
          low: '#58A6FF',
          info: '#6E7681',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [],
}
