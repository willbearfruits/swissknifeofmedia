/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#991b1b', // Red 800
        primaryLight: '#dc2626', // Red 600
        accent: '#ef4444', // Red 500
        accentDark: '#b91c1c', // Red 700
        surface: '#ffffff',
        background: '#fef2f2', // Red 50
        // Dark mode palette (pimped up)
        dark: {
            bg: '#0f172a',
            surface: '#1e293b',
            primary: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
