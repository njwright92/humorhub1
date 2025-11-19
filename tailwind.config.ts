import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors"; // 💡 Import default colors for merging

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
      // --- STREAMLINED COLORS ---
      colors: {
        // Keeping custom semantic colors
        darkBg: "#121212",
        darkAccent: "#1f1f1f",
        darkText: "#f5f5f5",

        // Redefine zinc while keeping access to ALL other zinc shades (e.g., zinc-50, zinc-400)
        zinc: {
          ...colors.zinc,
          900: "#1f2022",
          200: "#d4d4d8",
        },

        // Custom color mapping kept to maintain 'text-orange-500' usage in components
        orange: {
          ...colors.orange, // Inherit all standard orange shades for maximum compatibility
          500: "#fcd34d", // Overwrite orange-500 with Amber-300 hex
        },
      },
      // --- CONSOLIDATED SPACING ---
      // Replaces separate padding and margin entries. Use p-4.5 or m-4.5.
      spacing: {
        "4.5": "1.125rem",
      },
      // --- CUSTOM BORDER RADIUS ---
      borderRadius: {
        // Kept original 'xl'
        xl: "0.75rem",
        // Added 'soft' to enable 'rounded-soft' utility
        soft: "0.635rem",
      },
      // Kept custom shadows (these were already clean)
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
