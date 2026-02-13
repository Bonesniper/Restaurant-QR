import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#fef3e2", 100: "#fde4c4", 200: "#fbd49a", 300: "#f8bc65", 400: "#f59e20", 500: "#ea8310", 600: "#cf650b", 700: "#ac4a0c", 800: "#8c3b12", 900: "#733212" },
        status: { pending: "#f59e0b", preparing: "#3b82f6", ready: "#22c55e", served: "#6366f1", completed: "#64748b" },
      },
    },
  },
  plugins: [],
};

export default config;
