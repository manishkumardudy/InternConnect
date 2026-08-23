/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        },
        secondary: {
          light: '#334155',
          DEFAULT: '#0f172a',
          dark: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
