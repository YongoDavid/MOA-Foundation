"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV, SITE, currentNavHref } from "@/lib/site"
import MobileMenu from "./MobileMenu"

// Spec §3 — 88px paper, 1px hairline bottom.
//
// The header deliberately does NOT use the logo image. The supplied mark is a
// near-square badge at 813x951; in an 88px bar it shrinks to illegibility. The
// brass rule plus wordmark IS the header lockup. The logo appears in the
// footer only, at 300px.
export default function SiteHeader() {
  const pathname = usePathname() ?? "/"
  const currentHref = currentNavHref(pathname)
  const onDonate = pathname === "/donate"
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="border-b border-ink-900/[.14] bg-paper">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:h-[88px] lg:px-14">
          <Link href="/" className="flex items-center gap-[14px]">
            <span aria-hidden="true" className="h-8 w-[3px] bg-umber-600 lg:h-11" />
            <span>
              <span className="block font-display text-[13px] font-extrabold uppercase leading-[1.1] tracking-[.05em] text-ink-900 lg:text-[20px] lg:leading-none">
                {SITE.legalName}
              </span>
              <span className="mt-1 block font-body text-[9px] font-semibold uppercase leading-none tracking-[.16em] text-ink-400 lg:mt-1.5 lg:text-[10px]">
                {SITE.subtitle}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-[34px] lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const isCurrent = currentHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`relative font-body text-[11.5px] font-bold uppercase leading-none tracking-[.1em] transition-colors duration-150 hover:text-ink-900 ${
                    isCurrent ? "text-ink-900" : "text-ink-600"
                  }`}
                >
                  {item.label}
                  {isCurrent ? (
                    // Pinned to the header's bottom edge, not the item's.
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-[33px] left-0 right-0 h-[2px] bg-umber-600"
                    />
                  ) : null}
                </Link>
              )
            })}
            <Link
              href="/donate"
              aria-current={onDonate ? "page" : undefined}
              className={`px-[22px] py-[13px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] transition-colors duration-150 ${
                onDonate ? "bg-gold-500 text-ink-900" : "bg-ink-900 text-white"
              }`}
            >
              Donate
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="-mr-3 flex h-12 w-12 flex-col items-end justify-center gap-[5px] lg:hidden"
          >
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink-900" />
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink-900" />
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink-900" />
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        currentHref={currentHref}
        onClose={() => setMenuOpen(false)}
      />
    </>
  )
}
