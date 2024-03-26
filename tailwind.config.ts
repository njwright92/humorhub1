import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Add your new colors here
        darkBg: "#121212",
        darkAccent: "#1f1f1f",
        darkText: "#f5f5f5",
        zinc: {
          900: "#1f2022",
          200: "#d4d4d8",
        },
        orange: {
          500: "#ff6b6b",
        },
      },
      padding: {
        // Add any additional padding sizes you need
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem",
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      margin: {
        // Add any additional margin sizes you need
        "1.5": "0.375rem",
        "2.5": "0.625rem",
        "3.5": "0.875rem",
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "8.5": "2.125rem",
        "9.5": "2.375rem",
      },
      borderRadius: {
        // Add any additional border radius sizes you need
        xl: "0.75rem",
      },
      boxShadow: {
        // Add any additional shadows you need
        md: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      dropShadow: {
        // Add any additional drop shadows you need
        md: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
