/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Remove darkMode: 'class' — we're always dark now
  theme: {
    extend: {
      colors: {
        // Override grays to match dark theme
        gray: {
          50:  '#eef2f7',
          100: '#d0dbe8',
          200: '#a8b8cc',
          300: '#7a8fa3',
          400: '#5a7080',
          500: '#4a5f70',
          600: '#3d5166',
          700: '#2a3a4a',
          800: '#18222c',
          900: '#0e1318',
          950: '#080c10',
        },
        // Green accent
        green: {
          300: '#33ffaa',
          400: '#00ff88',
          500: '#00e07a',
          600: '#00b860',
        },
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}