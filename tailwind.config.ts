// TailwindCSS v4: CSS-first configuration via @theme in globals.css
// This file is kept minimal — custom tokens are now in globals.css @theme block.
// See: https://tailwindcss.com/docs/v4-upgrade
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
