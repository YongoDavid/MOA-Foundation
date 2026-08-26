import type { ReactNode } from "react"
import BlogScope from "@/components/blog/BlogScope"

// Nested inside the root layout — no <html> or <body> here.
export default function BlogLayout({ children }: { children: ReactNode }) {
  return <BlogScope>{children}</BlogScope>
}
