import type { ReactNode } from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import "@/app/blog/blog.css"

// Applies the blog's scoped palette and typeface.
//
// Shared because the mockup palette is needed in two places that do NOT share
// a layout: every /blog route, and the "From Our Blog" block that sits on the
// homepage. Without this the homepage block would render in Inter with
// undefined custom properties — visibly wrong, and silently so.
//
// next/font must be called at module scope, so the font instance lives here
// and both consumers import this component rather than re-declaring it.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
})

export default function BlogScope({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`${jakarta.variable} blog-scope ${className}`}>
      {children}
    </div>
  )
}
