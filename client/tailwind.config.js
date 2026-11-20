/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040812',
          900: '#0a1021',
          850: '#0e172e',
          800: '#131f3e',
          700: '#1c2d58',
          600: '#273e75',
          500: '#38559e',
        },
        vanguard: {
          red: '#e50914',
          crimson: '#b81d24',
          accent: '#ff1e27',
          gold: '#eab308',
          silver: '#94a3b8',
          bronze: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Montserrat', 'Impact', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
