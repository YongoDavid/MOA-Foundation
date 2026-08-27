import type { ReactNode } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import BlogScope from "@/components/blog/BlogScope"

// Nested inside the root layout — no <html> or <body> here.
//
// Header and Footer are REUSED, not re-implemented (spec §1). Without them the
// blog was a dead end: no logo, no nav, no way back to the site.
//
// They sit OUTSIDE BlogScope deliberately. The site shell keeps its own
// identity — royal-purple and Outfit — while only the blog content renders in
// the mockup palette. Wrapping them would silently restyle the header on blog
// pages only.
export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <BlogScope>{children}</BlogScope>
      <Footer />
      <ScrollToTopButton />
    </div>
  )
}
