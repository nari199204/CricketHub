export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: { 50: '#e8f5e9', 500: '#22c55e', 700: '#15803d', 900: '#0b3d1a' },
        ball: { 500: '#dc2626', 700: '#991b1b' },
      },
      fontFamily: { display: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
