/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'neon-green': '#97FB57',
        'dark-black': '#121212',
        'medium-gray': '#909090',
        'soft-white': '#F6F2F2',
      },
    },
  },
  plugins: [
    
  ],
}

