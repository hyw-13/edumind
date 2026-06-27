/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: "#faf7f2",
        "paper-soft": "#f5f0e8",
        "paper-deep": "#efe9dd",
        ink: {
          DEFAULT: "#1c1917",
          soft: "#44403c",
          muted: "#78716c",
          faint: "#a8a29e",
        },
        teal: {
          DEFAULT: "#0f766e",
          dark: "#115e59",
          deep: "#134e4a",
          light: "#14b8a6",
          pale: "#ccfbf1",
        },
        amber: {
          DEFAULT: "#ea580c",
          light: "#fb923c",
          pale: "#fed7aa",
        },
        rose: {
          DEFAULT: "#e11d48",
          pale: "#ffe4e6",
        },
        line: "#e7e5e4",
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,25,23,0.04), 0 4px 16px rgba(28,25,23,0.06)",
        lift: "0 4px 8px rgba(28,25,23,0.06), 0 16px 40px rgba(28,25,23,0.10)",
        glow: "0 0 0 1px rgba(15,118,110,0.12), 0 8px 32px rgba(15,118,110,0.16)",
      },
      backgroundImage: {
        'mesh-teal': "radial-gradient(at 0% 0%, rgba(15,118,110,0.10) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(234,88,12,0.08) 0px, transparent 50%)",
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'draw': {
          '0%': { strokeDashoffset: 'var(--len, 1000)' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
