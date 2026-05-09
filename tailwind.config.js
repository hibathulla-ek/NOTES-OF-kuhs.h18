/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1B4F8A',
          accent: '#2E75B6',
          light: '#D9E8F6',
        },
      },
    },
  },
  plugins: [],
}
