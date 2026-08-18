/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        qms: {
          border: '#e2e8f0',
          bg: '#f8fafc',
          card: '#ffffff',
          primary: '#4f46e5',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
