import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        fadeIn: "fadeIn 1s ease-in-out",
        slideIn: "slideIn 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme("colors.zinc.800"),
            a: {
              color: theme("colors.emerald.700"),
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              "&:hover": { color: theme("colors.emerald.800") },
            },
            h1: { fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "0.6em" },
            h2: { fontWeight: "700", letterSpacing: "-0.01em", marginTop: "1.6em", marginBottom: "0.5em" },
            h3: { fontWeight: "600", marginTop: "1.2em", marginBottom: "0.4em" },
            p: { marginTop: "0.6em", marginBottom: "0.6em" },
            ul: { marginTop: "0.6em", marginBottom: "0.6em" },
            ol: { marginTop: "0.6em", marginBottom: "0.6em" },
            strong: { color: theme("colors.zinc.900") },
            hr: { borderColor: theme("colors.zinc.200") },
            code: {
              color: theme("colors.zinc.900"),
              backgroundColor: theme("colors.zinc.100"),
              padding: "0.15rem 0.35rem",
              borderRadius: "0.375rem",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.zinc.200"),
            a: { color: theme("colors.emerald.300"), "&:hover": { color: theme("colors.emerald.200") } },
            strong: { color: theme("colors.white") },
            hr: { borderColor: theme("colors.zinc.700") },
            code: { color: theme("colors.white"), backgroundColor: theme("colors.zinc.800") },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;
