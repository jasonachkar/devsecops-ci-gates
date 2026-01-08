/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors - GitHub dark inspired
        bg: {
          primary: '#0D1117',
          secondary: '#161B22',
          tertiary: '#21262D',
          elevated: '#1C2128',
        },
        // Also add with dark- prefix for backward compatibility
        dark: {
          bg: {
            primary: '#0D1117',
            secondary: '#161B22',
            tertiary: '#21262D',
          },
          text: {
            primary: '#F0F6FC',
            secondary: '#8B949E',
            tertiary: '#6E7681',
          },
          border: {
            primary: '#30363D',
          },
        },
        // Border colors
        border: {
          DEFAULT: '#30363D',
          muted: '#21262D',
          accent: '#58A6FF',
        },
        // Text colors
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
        // Glass effect colors
        glass: {
          bg: 'rgba(22, 27, 34, 0.8)',
          border: 'rgba(48, 54, 61, 0.5)',
        },
        // Accent gradients
        accent: {
          purple: '#A855F7',
          blue: '#58A6FF',
          cyan: '#22D3EE',
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
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(88, 166, 255, 0.1)',
        'glow': '0 0 20px rgba(88, 166, 255, 0.15)',
        'glow-lg': '0 0 40px rgba(88, 166, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.2)',
        'glow-subtle': '0 0 15px rgba(88, 166, 255, 0.08)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #A855F7 0%, #6366F1 100%)',
        'gradient-blue': 'linear-gradient(135deg, #58A6FF 0%, #22D3EE 100%)',
        'gradient-success': 'linear-gradient(135deg, #22C55E 0%, #10B981 100%)',
        'gradient-error': 'linear-gradient(135deg, #F85149 0%, #EF4444 100%)',
        'gradient-warning': 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
        'gradient-dark': 'linear-gradient(180deg, #161B22 0%, #0D1117 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(88, 166, 255, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(168, 85, 247, 0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(34, 211, 238, 0.05) 0px, transparent 50%)',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(88, 166, 255, 0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(88, 166, 255, 0.2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [],
}
