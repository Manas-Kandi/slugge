import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#FAFAFA',
        text: {
          DEFAULT: '#0B0F13',
          secondary: '#5B6670',
          muted: '#9AA3AB'
        },
        border: '#E6E8EA',
        accent: '#2E7CF6',
        success: '#10B981',
        warn: '#F59E0B',
        danger: '#EF4444'
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px'
      },
      boxShadow: {
        soft1: '0 1px 2px rgba(0,0,0,0.06)',
        soft2: '0 4px 16px rgba(0,0,0,0.08)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: []
} satisfies Config
