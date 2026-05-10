/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#fff5f5',
          100: '#ffb3c1',
          200: '#ff8fa3',
          300: '#ff6b8a',
          400: '#e63946',
          500: '#c1121f'
        },
        gold: '#ffd700',
        cream: '#fff5f5'
      },
      fontFamily: {
        script: ['"Ma Shan Zheng"', 'cursive'],
        serif: ['"Noto Serif SC"', 'serif']
      }
    }
  },
  plugins: []
};
