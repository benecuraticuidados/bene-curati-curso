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
        wine: {
          DEFAULT: "#722F37",
          dark: "#5a252c",
          light: "#8b3a42",
        },
        brand: {
          red: "#c41e3a",
          gray: "#4a4a4a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
