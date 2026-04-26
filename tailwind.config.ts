// updated visual design — LoL aesthetic
const config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rift: {
          navy:   "#0A1428",
          dark:   "#1E2328",
          gold:   "#C89B3C",
          cream:  "#F0E6D3",
          blue:   "#0BC4E3",
          purple: "#2A1A4A",
        },
        night: {
          900: "#0A0F1E",
          800: "#0d1424",
          700: "#141d30",
        },
        gold: {
          300: "#F0E6D3",
          400: "#C89B3C",
          500: "#A07830",
          600: "#7A5820",
        },
        ember: {
          400: "#FF8A7A",
          600: "#E05B4F",
        },
        arc: {
          400: "#0BC4E3",
          200: "#7DE8F5",
          600: "#0899B3",
        },
      },
      fontFamily: {
        cinzel:  ["var(--font-cinzel)", "Georgia", "serif"],
        crimson: ["var(--font-crimson)", "Georgia", "serif"],
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        body:    ["var(--font-crimson)", "Georgia", "serif"],
      },
      boxShadow: {
        "gold-glow":  "0 0 24px rgba(200,155,60,0.45), 0 0 60px rgba(200,155,60,0.15)",
        "blue-glow":  "0 0 24px rgba(11,196,227,0.45), 0 0 60px rgba(11,196,227,0.12)",
        "card-depth": "0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
        glass:        "0 10px 40px rgba(5, 10, 25, 0.5)",
      },
      backgroundImage: {
        hero: [
          "radial-gradient(ellipse 1400px 700px at 15% 20%, rgba(42,26,74,0.6), transparent 60%)",
          "radial-gradient(ellipse 900px 500px at 85% 15%, rgba(200,155,60,0.12), transparent 55%)",
          "radial-gradient(ellipse 600px 400px at 50% 80%, rgba(11,196,227,0.06), transparent 50%)",
          "linear-gradient(180deg, #0A1428 0%, #0d1020 50%, #0A1428 100%)",
        ].join(", "),
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "fog-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.4" },
          "33%":      { transform: "translate(2%, 1%) scale(1.03)", opacity: "0.6" },
          "66%":      { transform: "translate(-1%, 2%) scale(0.98)", opacity: "0.35" },
        },
        "rune-pulse": {
          "0%, 100%": { opacity: "0.03" },
          "50%":      { opacity: "0.08" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "content-reveal": {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "cursor-trail": {
          "0%":   { opacity: "0.8", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.3)" },
        },
      },
      animation: {
        shimmer:        "shimmer 3s linear infinite",
        "fog-drift":    "fog-drift 18s ease-in-out infinite",
        "rune-pulse":   "rune-pulse 6s ease-in-out infinite",
        "pulse-ring":   "pulse-ring 0.7s ease-out forwards",
        reveal:         "content-reveal 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
      },
      clipPath: {
        "angle-down":    "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
        "angle-up":      "polygon(0 15%, 100% 0, 100% 100%, 0 100%)",
        "diagonal-left": "polygon(0 0, calc(100% - 2rem) 0, 100% 100%, 0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
