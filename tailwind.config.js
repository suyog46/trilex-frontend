/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        'primary-light': '#E6E9EF',
        'primary-light-hover': '#DADDE6',
        'primary-light-active': '#B3BACC',
        'primary-normal': '#091F5B',
        'primary-gradient': 'linear-gradient(90deg, #091F5B 0%, #47586e 100%)',

        'primary-normal-hover': '#081C52',
        'primary-normal-active': '#071949',
        'primary-dark': '#071744',
        'primary-dark-hover': '#051337',
        'primary-dark-active': '#040E29',
        'primary-darker': '#030B20',
        'secondary-light': '#b2bbc6',
        'secondary-light-hover': '#a3adbb',
        'secondary-light-active': '#909dad',
        'secondary-normal': '#546881',
        'secondary-normal-hover': '#47586e',
        'secondary-normal-active': '#3d4c5e',
        'secondary-dark': '#1d242d',
        'secondary-dark-hover': '#151a20',
        'secondary-dark-active': '#090b0e',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(90deg, #091F5B 0%, #47586e 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      // fontFamily: {
      //   'bricolage': ['"Bricolage Grotesque"', 'sans-serif'],
      // }
    }
  },
  plugins: []
}
