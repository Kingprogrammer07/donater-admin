/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        fg: {
          DEFAULT: "var(--fg)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
        },
        hairline: "var(--hairline)",
        brand: {
          DEFAULT: "var(--brand)",
          muted: "var(--brand-muted)",
        },
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
        sm: "var(--radius-sm)", // 8px
        md: "var(--radius-md)", // 12px
        lg: "var(--radius-lg)", // 16px
        pill: "9999px",
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
        title: ["20px", { lineHeight: "26px", letterSpacing: "-0.01em" }],
        display: ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
      },
    },
  },
  plugins: [],
};
