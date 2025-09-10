/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfb',
          100: '#ccfbf3',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#112f2c',
          600: '#0d2520',
          700: '#0a1e1b',
          800: '#081815',
          900: '#051211',
        },
        secondary: {
          50: '#fef7f4',
          100: '#feebe5',
          200: '#fdd4ca',
          300: '#fbb4a2',
          400: '#f88a6f',
          500: '#f48067',
          600: '#e55a3f',
          700: '#c1452f',
          800: '#9f3829',
          900: '#832f26',
        },
        tertiary: {
          50: '#fefef9',
          100: '#fefcf0',
          200: '#fdf7d8',
          300: '#fbf0bb',
          400: '#fbe6a0',
          500: '#f9da85',
          600: '#f0c74a',
          700: '#d9a826',
          800: '#b38617',
          900: '#916d12',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        glow: {
          from: {
            'text-shadow': '0 0 20px #f48067, 0 0 30px #f48067, 0 0 40px #f48067',
          },
          to: {
            'text-shadow': '0 0 10px #f48067, 0 0 20px #f48067, 0 0 30px #f48067',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
