/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f2ea",
        card: "#fffdf8",
        ink: "#1d1d18",
        accent: { DEFAULT: "#14543e", 2: "#1c6e51", soft: "#e8efe9" },
        line: "#dedacd",
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "sans-serif"],
        serif: ['"Lora"', "Georgia", "serif"],
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        pop: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(.99)" },
          "100%": { opacity: "1", transform: "none" },
        },
        fade: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        rise: "rise .45s ease both",
        pop: "pop .2s ease both",
        fade: "fade .15s ease both",
      },
    },
  },
  plugins: [],
};
