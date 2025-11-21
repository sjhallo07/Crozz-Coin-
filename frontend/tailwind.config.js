const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e7edff",
          200: "#cad6ff",
          300: "#a5b7ff",
          400: "#7c91ff",
          500: "#5a6bff",
          600: "#3d4df5",
          700: "#2936cd",
          800: "#1f2a9e",
          900: "#1c267c",
        },
      },
      boxShadow: {
        card: "0 10px 30px -15px rgba(15, 23, 42, 0.35)",
        "card-dark": "0 10px 30px -15px rgba(15, 23, 42, 0.85)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
