/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Redesign (spec v2.0 §2). Two families, no third.
        display: ["var(--font-display)", "Impact", "Haettenschweiler", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],

        // LEGACY — Outfit/Inter. Removed in Task 11 with the old components.
        sans: [
          "var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI",
          "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
          "Helvetica Neue", "sans-serif",
        ],
        heading: ["var(--font-outfit)", "sans-serif"],
      },

      // Square is the system default (spec §2 Layout): "No border-radius on
      // cards, buttons, inputs, media or badges. This is the design, not an
      // omission." `rounded-none` stays available; `rounded` now means 0.
      borderRadius: {
        DEFAULT: "0",
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        // Only the preloader rings and avatars need a circle.
        full: "9999px",
      },

      // The dot matrix is a 16-column grid (spec §6); Tailwind stops at 12.
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },

      colors: {
        // ── Redesign palette, spec v2.0 §2 Table 4 ──────────────────────
        // Nineteen tokens. Do not add a twentieth.
        "green-900": "#0D3B26",
        "green-950": "#16261E",
        "green-quote": "#14261D",
        "gold-500": "#C99A45",
        "gold-200": "#E4CFA4",
        "umber-600": "#B4762A",
        "umber-800": "#5B4A2E",
        "ink-900": "#141018",
        "ink-700": "#2B2630",
        "ink-600": "#4A4048",
        "ink-500": "#5C5460",
        "ink-400": "#857C86",
        paper: "#FBF8F3",
        panel: "#F3EEE4",
        "sand-200": "#E2DBCC",
        "sand-300": "#DFD6C6",
        "sand-400": "#C4B79E",
        danger: "#A03A2A",

        // ── LEGACY. Retired by spec v2.0; removed in Task 11 once the old
        // components that reference them are deleted. Keeping them until then
        // is what lets the site stay coherent mid-rebuild.
        "royal-purple": "#6d28d9",
        teal: "#14b8a6",
        "bright-orange": "#fb923c",
        "light-gray": "#e5e7eb",
        "dark-gray": "#1f2937",
        "medium-gray": "#6b7280",
        "dark-navy": "#0f172a",
        "orange-accent": "#fb6b35",
      },
    },
  },
  plugins: [],
}
