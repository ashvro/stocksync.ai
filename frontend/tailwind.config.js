/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#ff4d00', // Neon Orange
          600: '#e64500',
          700: '#cc3d00',
          900: '#7c2d12',
          gold: '#d97706',
          pink: '#ff007f', // Cyber Pink
          cyan: '#00f2ff', // Neon Cyan
        },
        dark: {
          950: '#020617', // Deeper Obsidian
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'neon-pulse': 'neonPulse 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'drop-shadow(0 0 15px rgba(255, 77, 0, 0.5))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 25px rgba(255, 77, 0, 0.8))' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        neonPulse: {
          'from': { 'text-shadow': '0 0 5px #ff4d00, 0 0 10px #ff4d00, 0 0 20px #ff007f' },
          'to': { 'text-shadow': '0 0 10px #ff4d00, 0 0 20px #ff4d00, 0 0 40px #ff007f' },
        }
      }
    },
  },
  plugins: [],
}
