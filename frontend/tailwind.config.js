/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { brand: { 50: '#eef4ff', 100: '#dbe8ff', 500: '#1a73e8', 600: '#1565d8', 700: '#1257b8' } }, fontFamily: { sans: ['ui-sans-serif', 'system-ui', 'sans-serif'] } } },
  plugins: [],
}
