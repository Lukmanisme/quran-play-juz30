/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri Quran"', '"Scheherazade New"', 'serif'],
        arabicAlt: ['"Scheherazade New"', '"Amiri Quran"', 'serif'],
      },
    },
  },
  plugins: [],
};
