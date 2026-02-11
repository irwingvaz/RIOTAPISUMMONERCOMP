/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          900: "#0A0F1E",
          800: "#11182A",
          700: "#18213A"
        },
        glacier: {
          50: "#EAF3FF",
          200: "#A8C7FF",
          400: "#5C8DFF",
          600: "#2E56D6"
        },
        gold: {
          400: "#E6C46A",
          500: "#CBA54B",
          600: "#A98635"
        },
        emerald: {
          400: "#5EE6B8",
          600: "#2EAE86"
        },
        ember: {
          400: "#FF8A7A",
          600: "#E05B4F"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(92, 141, 255, 0.25)",
        glass: "0 10px 40px rgba(5, 10, 25, 0.5)"
      },
      backgroundImage: {
        hero: "radial-gradient(1200px 600px at 10% 10%, rgba(92,141,255,0.18), transparent 60%), radial-gradient(800px 500px at 90% 20%, rgba(230,196,106,0.18), transparent 60%), linear-gradient(180deg, #0A0F1E 0%, #0D1326 60%, #0A0F1E 100%)"
      },
      fontFamily: {
        display: ["Cinzel", "Trajan Pro", "Times New Roman", "serif"],
        body: ["Manrope", "Segoe UI", "Tahoma", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
