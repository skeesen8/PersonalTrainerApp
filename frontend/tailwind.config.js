/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'miami-teal': 'var(--miami-teal)',
        'miami-pink': 'var(--miami-pink)',
        'miami-purple': 'var(--miami-purple)',
        'miami-orange': 'var(--miami-orange)',
        'miami-blue': 'var(--miami-blue)',
        'miami-night': 'var(--miami-night)',
        'miami-light': 'var(--miami-light)',
      },
    },
  },
  plugins: [],
} 