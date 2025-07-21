/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily:{
        fell: ['"IM Fell English"', ...defaultTheme.fontFamily.sans]
      },
      height: {
        'screen-85': '85vh',
      }
    },
  },
  plugins: [],
}