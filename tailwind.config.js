/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:     ["Space Mono", "monospace"],
        armenian: ["Noto Serif Armenian", "serif"],
        sans:     ["Space Mono", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          amber:  "#F59E0B",
          orange: "#F97316",
          dark:   "#0a0a0f",
          card:   "#111118",
        },
      },
      animation: {
        "fade-up":    "fadeUp 0.4s ease-out forwards",
        "fade-in":    "fadeIn 0.3s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
