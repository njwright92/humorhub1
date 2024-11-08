import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}", // Add other directories if needed
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
        zinc: {
          900: "#1f2022",
          200: "#d4d4d8",
        },
        orange: {
          500: "#a8ffdc",
        },
      },
      padding: {
        "4.5": "1.125rem", // Unique custom padding
      },
      margin: {
        "4.5": "1.125rem", // Unique custom margin
      },
      borderRadius: {
        xl: "0.75rem", // Additional border-radius
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
