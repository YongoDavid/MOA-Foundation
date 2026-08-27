/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Redesign (spec v2.0 §2). Two families, no third.
        // Big Shoulders is the only face Next cannot build a metric-adjusted
        // fallback for — `next build` says so on every run. Manrope gets a
        // generated "Manrope Fallback"; the display face does not, so whatever
        // is listed here is what renders during the swap.
        //
        // The old stack was Impact -> Haettenschweiler -> sans-serif, and
        // NEITHER of the first two exists on iOS or Android. Every heading on
        // a phone therefore fell straight through to a normal-width sans and
        // then snapped to a condensed one when the webfont arrived — the
        // largest reflow on the page, on the largest text. The condensed faces
        // that actually ship on each platform now come first.
        display: [
          "var(--font-display)",
          "Impact",                   // Windows, macOS
          "Haettenschweiler",         // Windows
          "Arial Narrow",             // Windows, macOS
          "Roboto Condensed",         // Android
          "Avenir Next Condensed",    // iOS, macOS
          "HelveticaNeue-CondensedBold",
          "sans-serif",
        ],
        body: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],

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
      },
    },
  },
  plugins: [],
}
