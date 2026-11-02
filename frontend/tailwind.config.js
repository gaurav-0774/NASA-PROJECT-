// tailwind.config.js — Tailwind CSS configuration with space theme colors
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0a0e27',
          800: '#111640',
          700: '#1a1f4e',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        neon: '#00f0ff',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
