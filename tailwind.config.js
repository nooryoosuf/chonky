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
          subtle: '#F7F3EC',
          // Dark mode specific tokens
          dark: {
            bg: '#0F0909',
            surface: '#170E0E',
            card: '#1F1414',
            cardHover: '#291A1A',
            border: '#331B1B',
            text: '#F7F3EE',
            muted: '#B09E96'
          }
        }
      },
      fontFamily: {
        sans: ['"Satoshi"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Satoshi"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 16px -2px rgba(112, 8, 8, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 10px 30px -4px rgba(30, 27, 24, 0.07), 0 2px 8px -2px rgba(112, 8, 8, 0.04)',
        'hover': '0 20px 40px -8px rgba(112, 8, 8, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 25px 60px -15px rgba(112, 8, 8, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        'sheet': '0 -12px 40px -5px rgba(30, 27, 24, 0.14)',
        'glow-red': '0 8px 24px -4px rgba(112, 8, 8, 0.35)',
        'glow-peach': '0 8px 24px -4px rgba(242, 226, 199, 0.5)'
      }
    },
  },
  plugins: [],
}
