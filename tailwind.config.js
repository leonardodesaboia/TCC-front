/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './App/**/*.{js,jsx,ts,tsx}', './routes/**/*.{js,jsx,ts,tsx}', './contexts/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-alt': '#FFF4EA',
        foreground: '#212121',
        primary: '#E98936',
        'primary-dark': '#D77219',
        'primary-deep': '#B85600',
        'primary-soft': '#E4A87B',
        brown: '#5C2F12',
        'brown-light': '#AF5D1F',
        'gray-1': '#A69A84',
        'gray-2': '#CFC4B7',
        'gray-3': '#CACACA',
        'gray-4': '#EAEAEA',
        'black-1': '#212121',
        'black-2': '#000000',
      },
      fontSize: {
        'display-lg': ['36px', { lineHeight: '42px' }],
        'display-md': ['30px', { lineHeight: '36px' }],
        'title-lg': ['24px', { lineHeight: '30px' }],
        'title-sm': ['20px', { lineHeight: '26px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'label-lg': ['13px', { lineHeight: '18px' }],
      },
      borderRadius: {
        card: '28px',
      },
    },
  },
  plugins: [],
};
