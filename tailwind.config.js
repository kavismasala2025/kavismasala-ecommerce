/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50:  '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c5c5',
          300: '#f49a9a',
          400: '#ec6060',
          500: '#df3030',
          600: '#c31f1f',
          700: '#9e1515',
          800: '#7b1212',  // primary maroon (matches header)
          900: '#6a1010',  // deep maroon
          950: '#3d0808',
        },
        cream: {
          50:  '#fdf9f3',
          100: '#faefd8',
          200: '#f5ddb0',
          300: '#eec87a',
          400: '#e5ae49',
        },
      },
    },
  },
  plugins: [],
};
