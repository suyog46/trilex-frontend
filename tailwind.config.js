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
      // fontFamily: {
      //   'bricolage': ['"Bricolage Grotesque"', 'sans-serif'],
      // }
    }
  },
  plugins: []
}
