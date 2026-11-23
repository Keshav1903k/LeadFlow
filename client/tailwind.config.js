/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7F5F0",
        surface: "#FFFFFF",
        border: "#E7E3DB",
        primary: {
          DEFAULT: "#0E7C66",
          hover: "#0B6654",
          light: "#E8F3F0",
        },
        text: {
          main: "#1A1A17",
          muted: "#5C5A54",
          subtle: "#8A8880",
        },
        status: {
          new: "#64748B",
          contacted: "#D97706",
          qualified: "#0E7C66",
          lost: "#B91C1C",
        },
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
