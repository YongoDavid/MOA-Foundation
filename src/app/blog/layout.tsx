import type { ReactNode } from "react"
import BlogScope from "@/components/blog/BlogScope"

// The site shell (header, footer, utility strip) now lives in the root layout,
// so every route gets it. This layout only applies the blog's own scope, which
// Task 10 removes when the blog moves onto the site palette.
export default function BlogLayout({ children }: { children: ReactNode }) {
  return <BlogScope>{children}</BlogScope>
}
