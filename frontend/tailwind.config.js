/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1f2e',
        secondary: '#1e2433',
        tertiary: '#2d3748',
        'text-primary': '#e2e8f0',
        'text-secondary': '#a0aec0',
        'border-color': '#2d3748',
        'blue': '#4299e1',
        'green': '#48bb78',
        'red': '#f56565',
        'yellow': '#f6ad55',
      },
    },
  },
  plugins: [],
}
