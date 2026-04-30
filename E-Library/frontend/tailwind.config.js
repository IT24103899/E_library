/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#1F2937",
        accent: "#10B981",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
