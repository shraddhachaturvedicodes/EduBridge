module.exports = {
  plugins: {
    // We use @tailwindcss/postcss here as recommended by the error message
    // because the direct 'tailwindcss' plugin is deprecated in newer setups.
    "@tailwindcss/postcss": {}, 
    "autoprefixer": {},
  },
}