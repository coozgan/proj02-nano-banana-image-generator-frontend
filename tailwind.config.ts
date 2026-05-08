import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0b1326",
          surface: "#171f33",
          "surface-high": "#2d3449",
        },
        primary: {
          DEFAULT: "#c0c1ff",
          container: "#8083ff",
          on: "#1000a9",
        },
        secondary: {
          DEFAULT: "#4cd7f6",
          container: "#03b5d3",
          on: "#003640",
        },
        tertiary: {
          DEFAULT: "#ffb783",
          container: "#d97721",
        },
        on: {
          surface: "#dae2fd",
          variant: "#c7c4d7",
        },
        outline: {
          DEFAULT: "#908fa0",
          variant: "#464554",
        },
        success: "#10b981",
        warning: "#ffb783",
        error:   "#ffb4ab",
      },
      fontFamily: {
        sans:    ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
      boxShadow: {
        glow:    "0 0 10px rgba(192, 193, 255, 0.30)",
        "glow-lg": "0 0 24px rgba(192, 193, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
        "glow-cyan": "0 0 12px rgba(76, 215, 246, 0.35)",
      },
      backdropBlur: {
        glass: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
