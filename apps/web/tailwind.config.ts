/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Partora dark background
        background: {
          DEFAULT: "#0D0D14",
          secondary: "#13131E",
          tertiary: "#1A1A28",
        },
        border: {
          DEFAULT: "#2A2A40",
          subtle: "#1E1E30",
        },
        // SATB voice colours
        soprano: { DEFAULT: "#7F77DD", light: "#A39BEC", dark: "#534AB7" },
        alto:    { DEFAULT: "#2DA882", light: "#4FC99F", dark: "#1A7A5C" },
        tenor:   { DEFAULT: "#D4820A", light: "#F0A030", dark: "#A05F05" },
        bass:    { DEFAULT: "#185FA5", light: "#3080CC", dark: "#0D3D6E" },
        // Semantic
        muted: "#6B6B8A",
        "muted-foreground": "#4A4A6A",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite",
        "bounce-subtle": "bounce-subtle 0.6s ease infinite alternate",
        waveform: "waveform 1.2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.1)", opacity: "0.3" },
          "100%": { transform: "scale(0.95)", opacity: "0.7" },
        },
        "bounce-subtle": {
          "0%": { transform: "scaleY(0.4)" },
          "100%": { transform: "scaleY(1)" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
