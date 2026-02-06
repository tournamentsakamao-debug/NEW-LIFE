/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          500: '#EAB308',
          600: '#CA8A04',
          shadow: 'rgba(234, 179, 8, 0.4)',
        },
        black: '#050505',
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(to bottom right, #111, #000)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

