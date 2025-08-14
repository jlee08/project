/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E1E1E',
        secondary: '#EEEEEE',
        accent: '#PNVXPB',
        background: '#FFFFFF',
        text: '#000000',
        'amber-900': '#3D1A0D',
        'gray-228': '#E4E4E4',
      },
      fontFamily: {
        'gowun': ['Gowun Batang', 'serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'rethink': ['Rethink Sans', 'sans-serif'],
      },
      spacing: {
        '17': '4.25rem',
        '25': '6.25rem',
      },
      fontSize: {
        '7xl': ['4.375rem', { lineHeight: '1em', letterSpacing: '-3%' }],
      },
      backdropBlur: {
        '4': '4px',
      },
    },
  },
  plugins: [],
}
