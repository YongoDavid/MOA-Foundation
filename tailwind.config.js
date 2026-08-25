/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // The system stack after the webfont mirrors what src/index.css had on
        // `body` before the migration. next/font swaps Inter in once loaded, so
        // this chain is what renders during the swap window — dropping it to a
        // bare `sans-serif` would be a visible change on first paint.
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          "Fira Sans",
          "Droid Sans",
          "Helvetica Neue",
          "sans-serif",
        ],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      colors: {
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