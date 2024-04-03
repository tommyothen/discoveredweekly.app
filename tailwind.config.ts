import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        circular: ["Circular Sp", "sans-serif"],
        "circular-title": ["Circular Sp Title", "sans-serif"],
      },
      colors: {
        spotify: {
          white: "#f6f6f6",
          black: "#000000",
          grey: {
            900: "#121212",
            800: "#242424",
            700: "#1f1f1f",
          },
          pink: "#a33693",
          blue: "#6299f0",
          green: "#1DB954",
          "green-dark": "#1AA34A",
        },
      },
      animation: {
        "gradient-background": "gradient-background 5s ease infinite",
      },
      keyframes: {
        "gradient-background": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
