/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
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