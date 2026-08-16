/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-on-primary)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-on-primary)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-on-primary)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        border: "var(--color-border)",
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-on-primary)",
        },
        ring: "var(--color-ring)",
        status: {
          ok: {
            DEFAULT: "var(--status-ok)",
            bg: "var(--status-ok-bg)",
          },
          warn: {
            DEFAULT: "var(--status-warn)",
            bg: "var(--status-warn-bg)",
          },
          fail: {
            DEFAULT: "var(--status-fail)",
            bg: "var(--status-fail-bg)",
          },
          neutral: {
            DEFAULT: "var(--status-neutral)",
            bg: "var(--status-neutral-bg)",
          },
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        0: "none",
        1: "var(--elevation-1)",
        2: "var(--elevation-2)",
        3: "var(--elevation-3)",
      },
      zIndex: {
        0: "0",
        10: "10",
        20: "20",
        40: "40",
        100: "100",
        1000: "1000",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "4xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};
