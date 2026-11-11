export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: '#134E4A',
        accent: '#C85A28',
        background: '#F8F6F1',
        success: '#1E7A50',
        warning: '#D97706',
        ink: '#16211E',
        sand: '#F0ECE1',
        border: '#E5E0D5',
      },
      fontFamily: {
        poppins: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}