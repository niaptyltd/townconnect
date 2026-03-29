import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "var(--brand-ink)",
          forest: "var(--brand-forest)",
          emerald: "var(--brand-emerald)",
          sand: "var(--brand-sand)",
          gold: "var(--brand-gold)",
          mist: "var(--brand-mist)",
          line: "var(--brand-line)"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 64px -24px rgba(11, 36, 29, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
