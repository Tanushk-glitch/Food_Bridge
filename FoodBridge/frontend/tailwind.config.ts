import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(58, 130, 78, 0.20)",
        soft: "0 8px 30px rgba(0, 0, 0, 0.04)",
        "soft-lg": "0 16px 40px rgba(0, 0, 0, 0.06)",
        "primary-hover": "0 20px 60px rgba(58, 130, 78, 0.12)"
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(circle at top right, rgba(58, 130, 78, 0.08) 0%, rgba(180, 83, 9, 0.05) 50%, transparent 100%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(58, 130, 78, 0.25)" },
          "50%": { boxShadow: "0 0 0 14px rgba(58, 130, 78, 0)" }
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.8s infinite",
        ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
