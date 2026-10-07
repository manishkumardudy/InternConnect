/** @type {import('tailwindcss').Config} */
export default {
  // 'class' rakha hai kyunki purane pages me abhi bhi dark: classes hain.
  // Hum 'dark' class kabhi lagate nahi, isliye poori site white (light) hi rahegi.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Ek hi primary color (Internshala jaisa blue). Poori site me yahi use karenge.
        primary: {
          50: '#e8f5fd',
          100: '#cde9fa',
          DEFAULT: '#008BDC',
          dark: '#0070b0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
