import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f5f7fb",
        coral: "#f9735b",
        teal: "#0f9f9a",
        grape: "#6d5dfc"
      }
    }
  },
  plugins: []
};

export default config;
