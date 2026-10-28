/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chonky: {
          red: '#700808',
          'red-dark': '#550505',
          'red-light': '#8f1212',
          peach: '#F2E2C7',
          'peach-light': '#FBF6EE',
          'peach-dark': '#E5D0B0',
          bg: '#FFFCF8',
          card: '#FFFFFF',
          text: '#1E1B18',
          muted: '#6E6760',
          border: '#EBE5DC',
          subtle: '#F7F3EC'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(112, 8, 8, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(30, 27, 24, 0.06)',
        'modal': '0 20px 45px -10px rgba(112, 8, 8, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.08)',
        'sheet': '0 -10px 30px -5px rgba(30, 27, 24, 0.12)'
      }
    },
  },
  plugins: [],
}
