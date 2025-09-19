/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf3',
          100: '#d6f7e1',
          200: '#aeeec5',
          300: '#77dd9f',
          400: '#44c575',
          500: '#1d9c4e',
          600: '#127a3b',
          700: '#0f6131',
          800: '#0d4d29',
          900: '#0b3f24'
        },
        surface: '#111418'
      }
    }
  },
  plugins: []
}
