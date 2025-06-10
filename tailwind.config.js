/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'emergency': '#ce3c3a',
        'success': '#4cae83',
        'primary': '#4e55b9',
        'warning': '#f2c94c',
        'header': '#1c3356',
        'bg-cream': '#fffcf5',
        'bg-light': '#f4f5f7',
      },
    },
  },
  plugins: [],
};