/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // indigo brand scale (kept + extended to 800/900 for depth)
        brand: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc",
          400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca",
          800: "#3730a3", 900: "#312e81",
        },
        // Lumen palette
        accent: "#7C3AED",      // violet accent — matches gradient-to
        ink: "#0E1116",         // near-black text
        muted: "#5B6478",       // secondary text
        surface: "#FFFFFF",     // cards / panels
        bg: "#FAFAFC",          // page background
        dark: "#0B0D17",        // dark bands / footer
        "gradient-from": "#4338CA",
        "gradient-to": "#7C3AED",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        stat: ["Sora", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "10px",
        DEFAULT: "12px",
        md: "16px",
        lg: "24px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        // kept
        card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.1)",
        soft: "0 4px 16px rgba(16,24,40,.08)",
        // new signature glow on primary CTAs
        glow: "0 8px 30px rgba(79,70,229,.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-14px,0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22,1,0.36,1) both",
        float: "float 24s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
