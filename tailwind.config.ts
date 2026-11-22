import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        jee: {
          dark: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          physics: "#3b82f6",
          chemistry: "#10b981",
          maths: "#f59e0b",
          accent: "#6366f1"
        }
      }
    },
  },
  plugins: [],
};
export default config;
