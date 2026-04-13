/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        success:  { DEFAULT: '#10b981', dark: '#059669' },
        danger:   { DEFAULT: '#f43f5e', dark: '#e11d48' },
        warning:  { DEFAULT: '#f59e0b', dark: '#d97706' },
        surface:  { DEFAULT: '#1e293b', dark: '#0f172a', light: '#334155' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease',
        'fade-in':  'fadeIn 0.4s ease',
        'bounce-dot': 'bounceDot 1.2s infinite',
      },
      keyframes: {
        slideIn:   { from: { transform: 'translateX(100%)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn:    { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceDot: { '0%,80%,100%': { transform: 'scale(0)' }, '40%': { transform: 'scale(1)' } },
      }
    }
  },
  plugins: []
}
