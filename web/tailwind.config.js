/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ark: {
          amber: '#f59e0b',
          'amber-dim': '#d97706',
          'amber-glow': '#fbbf24',
        },
        surface: {
          base: '#0d0f14',
          DEFAULT: '#161a24',
          elevated: '#1e2435',
          overlay: '#252b3d',
        },
        border: {
          DEFAULT: '#2a3045',
          subtle: '#1e2435',
          strong: '#3b4565',
        },
        status: {
          running: '#10b981',
          stopped: '#6b7280',
          crashed: '#ef4444',
          updating: '#3b82f6',
          installing: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
