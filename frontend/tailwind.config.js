/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'galaxy': {
          'purple': '#8B5CF6',
          'blue': '#3B82F6',
          'pink': '#EC4899',
          'dark': '#0F172A',
        }
      },
      backgroundImage: {
        'galaxy': "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
