import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        darkBg: "#121212",
        darkAccent: "#1f1f1f",
        darkText: "#f5f5f5",

        // 1. UPDATED ZINC COLORS
        zinc: {
          ...colors.zinc,
          900: "#2e2c28", // New Dark
          200: "#f4f4f5", // New Light
        },

        // 2. UPDATED ACCENT COLORS
        // We map your new accent #b35a30 to the classes you already use
        orange: {
          ...colors.orange,
          500: "#b35a30",
        },
        amber: {
          ...colors.amber,
          300: "#b35a30", // Now 'text-amber-300' will be your new accent color
        },
      },
      spacing: {
        "4.5": "1.125rem",
      },
      borderRadius: {
        xl: "0.75rem",
        soft: "0.635rem",
      },
      boxShadow: {
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      dropShadow: {
        md: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
