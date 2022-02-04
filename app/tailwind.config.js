const colors = require('tailwindcss/colors');

const theme = {
  primary: '#F12E45',
  secondary: '#0D122B',
  tertiary: '#676767',
  dark: '#676767',
  light: '#C2C2C2',
  link: '#008CFF',
};

module.exports = {
  mode: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  important: true,
  theme: {
    extend: {
      colors: {
        ...colors,
        ...theme,
        button: {
          ...theme,
        },
        backgroundColors: (theme) => ({
          ...theme, ...colors,
        }),
        borderColor: (theme) => ({
          ...theme, ...colors,
        }),
        textColor: (theme) => ({
          ...theme, ...colors,
        }),
      },
      animation: {
        spin: 'spin 2s linear infinite'
      },
      boxShadow: {
        card: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        patientHeader: '0px 4px 11px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
