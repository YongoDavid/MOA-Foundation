import type { ReactNode } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./blog.css"

// The mockups specify Plus Jakarta Sans 400–800. Self-hosted by next/font, so
// no request reaches Google. Exposed as a variable and consumed by .blog-scope
// rather than applied globally — the rest of the site keeps Inter and Outfit.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  // Nested inside the root layout — no <html> or <body> here.
  return (
    <div className={`${jakarta.variable} blog-scope`}>{children}</div>
  )
}
