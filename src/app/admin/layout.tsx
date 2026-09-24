import type { ReactNode } from "react"

export const metadata = {
  robots: { index: false, follow: false },
}

/**
 * Never prerender, never cache. An authenticated page rendered at build time
 * and served from a cache is the same page for everyone who asks.
 *
 * Without this it was implicit and fragile: /admin only became dynamic
 * because reading the session touches cookies(), and with the environment
 * unset that code path is skipped — so the route's rendering mode depended on
 * whether the credentials happened to be present during the build.
 */
export const dynamic = "force-dynamic"

// The admin area sits inside the root layout, so it inherits the site header,
// footer and preloader. That is deliberate: it is the same website, staff are
// often one click from the public pages, and a second shell would be a second
// thing to maintain.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
