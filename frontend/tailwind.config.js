/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0f172a',      // deep navy
          navy: '#1e3a8a',      // IRCTC / modern IR blue
          blue: '#2563eb',      // vibrant blue
          sky: '#38bdf8',       // light indicator
          accent: '#ea580c',    // Indian railway saffron/orange accent
          crimson: '#dc2626',   // alert/express red
          gold: '#f59e0b',      // warning / delayed
          green: '#16a34a',     // on time / active
          track: '#475569',     // slate ballast
          light: '#f8fafc',     // clean background
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
