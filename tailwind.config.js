/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#14111F',
        tile: '#1E1A2E',
        wall: '#2B2740',
        'neon-green': '#39FF88',
        'neon-cyan': '#37E6D0',
        'neon-red': '#E5484D',
        'neon-orange': '#FF7A1A',
        'neon-blue': '#5DA9FF',
        'purple-btn': '#7C3AED',
        'purple-hover': '#9F67FF',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
};
