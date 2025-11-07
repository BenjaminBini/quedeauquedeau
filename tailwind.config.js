const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          danger: {
            DEFAULT: "#dc2626",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#ea580c",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
}
