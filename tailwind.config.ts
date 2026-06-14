import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired bright palette
        feather: {
          50: "#EEFCDF",
          100: "#D7F8B5",
          200: "#AEF06B",
          300: "#89E219",
          400: "#76C012",
          DEFAULT: "#58CC02", // primary green
          600: "#4CAD02",
          700: "#3D8C01",
        },
        macaw: {
          50: "#E1F7FF",
          100: "#B8ECFF",
          DEFAULT: "#1CB0F6", // sky blue
          600: "#0F9AD9",
          700: "#0B7CB0",
        },
        bee: {
          50: "#FFF9E0",
          100: "#FFEEAE",
          DEFAULT: "#FFC800", // sunny yellow
          600: "#E0AE00",
          700: "#B88E00",
        },
        fox: {
          DEFAULT: "#FF9600", // orange
          600: "#E08400",
        },
        cardinal: {
          50: "#FFE9E9",
          100: "#FFC2C2",
          DEFAULT: "#FF4B4B", // red / hearts
          600: "#E63E3E",
          700: "#C53030",
        },
        beetle: {
          50: "#F4E8FF",
          100: "#E4C2FF",
          DEFAULT: "#CE82FF", // purple
          600: "#B35BFF",
          700: "#9234E0",
        },
        eel: {
          DEFAULT: "#4B4B4B", // dark text
          light: "#777777",
        },
        snow: "#FFFFFF",
        cloud: "#F7F7F7",
        wolf: "#AFAFAF",
      },
      fontFamily: {
        heading: ["var(--font-baloo)", "ui-rounded", "sans-serif"],
        body: ["var(--font-nunito)", "ui-sans-serif", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        // "pressable" Duolingo-style button shadow
        duo: "0 4px 0 0 var(--tw-shadow-color)",
        "duo-sm": "0 2px 0 0 var(--tw-shadow-color)",
        "duo-lg": "0 6px 0 0 var(--tw-shadow-color)",
        card: "0 4px 12px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.3)", opacity: "0" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        wiggle: "wiggle 0.6s ease-in-out infinite",
        pop: "pop 0.35s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
