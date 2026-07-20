/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  // Pastel card colors are applied via template literals (bg-${color}),
  // so they are not statically discoverable — safelist them explicitly.
  safelist: [
    'bg-pink',
    'bg-yellow',
    'bg-lavender',
    'bg-cardmint',
    'bg-blue',
    'bg-coral',
  ],
  theme: {
    extend: {
      colors: {
        mint1: '#BFF5DF',
        mint2: '#D8FBEA',
        // theme-aware tokens (see :root / .dark in index.css)
        app: 'rgb(var(--bg) / <alpha-value>)',
        cream: 'rgb(var(--panel) / <alpha-value>)',
        cream2: 'rgb(var(--panel2) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        pink: '#F7BFC4',
        yellow: '#FFE2AC',
        lavender: '#D8D2FF',
        cardmint: '#BDEFD8',
        blue: '#CDEBFF',
        coral: '#F7A7A7',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        // fixed dark ink for text on pastel cards (they stay light in both themes)
        cink: '#17171c',
        dark: '#090812',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        // playful rounded display face for the kids' games arcade
        game: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        window: '32px',
        panel: '28px',
        card: '24px',
      },
      boxShadow: {
        window: '0 40px 80px -20px rgba(20, 40, 30, 0.25), 0 12px 32px -12px rgba(20, 40, 30, 0.12)',
        card: '0 8px 24px -12px rgba(20, 30, 25, 0.18)',
        lift: '0 18px 40px -16px rgba(20, 30, 25, 0.28)',
        soft: '0 2px 10px -4px rgba(20, 30, 25, 0.12)',
      },
      maxWidth: {
        window: '1440px',
      },
      // Continuous motion for the Animations page. Applied via `motion-safe:`
      // so `prefers-reduced-motion: reduce` users get static visuals.
      keyframes: {
        // traveling pulse along a wave (animates an overlay dash)
        dashflow: {
          to: { strokeDashoffset: '-32' },
        },
        // beams falling from space toward Earth
        'beam-fall': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '12%': { opacity: '1' },
          '88%': { opacity: '1' },
          '100%': { transform: 'translateY(var(--beam-dist, 60px))', opacity: '0' },
        },
        // gentle fade + rise, used when swapping rotating text content
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // indeterminate loading bar: a highlight sweeps across the track
        'loader-sweep': {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(360%)' },
        },
      },
      animation: {
        dashflow: 'dashflow 1s linear infinite',
        'beam-fall': 'beam-fall 2.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'loader-sweep': 'loader-sweep 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
