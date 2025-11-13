// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        accent: '#06b6d4',
        'accent-2': '#7c3aed'
      },
    },
  },
  plugins: [],
}
