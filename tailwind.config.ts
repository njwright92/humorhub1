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
        beige: "#f5f5dc",
        modernInputBorder: "#c0c0c0",
        modernInputBg: "#e5e0e0",
        eventItemBorder: "#005eff",
        modalContainerBg: "#f5f5f5",
        modalContainerBorder: "#646262",
        authButtonBg: "#000000",
        closeButton: "#6b7280",
        standardInputBorder: "#d1d5db",
        standardInputBg: "#f9fafb",
        theText: "#4b5563",
        darkBg: "#121212", // Dark background
        darkAccent: "#1f1f1f", // Slightly lighter for cards, modals, etc.
        darkText: "#f5f5f5", // Text color for readability
        // ... existing colors
      },
      boxShadow: {
        // Neumorphism shadow in dark mode
        "neu-soft-dark":
          "4px 4px 8px 0 rgba(0, 0, 0, 0.4), -4px -4px 8px 0 rgba(255, 255, 255, 0.1)",
        "neu-pressed-dark":
          "inset 4px 4px 8px 0 rgba(0, 0, 0, 0.4), inset -4px -4px 8px 0 rgba(255, 255, 255, 0.1)",
        // ... other shadows
      },
      dropShadow: {
        "custom-green": "0 2px 4px #047857", // green-700 color
      },
    },
  },
  plugins: [],
};
export default config;
