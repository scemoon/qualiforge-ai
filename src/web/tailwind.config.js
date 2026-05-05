/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE',
          500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 900: '#312E81',
        },
        gold: { 300: '#FCD34D', 500: '#F59E0B' },
        success: { 500: '#10B981', 600: '#059669' },
        warning: { 500: '#F59E0B', 600: '#D97706' },
        error: { 500: '#EF4444', 600: '#DC2626' },
        info: { 500: '#0EA5E9' },
      }
    }
  },
  plugins: [],
}
