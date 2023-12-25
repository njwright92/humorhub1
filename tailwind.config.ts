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
      },
    },
  },
  plugins: [],
};
export default config;
