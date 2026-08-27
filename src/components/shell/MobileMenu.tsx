"use client"

import { useEffect } from "react"
import Link from "next/link"
import { NAV, SITE } from "@/lib/site"

// Spec §3 — full-screen ink-900 panel. The only motion permitted here is a
// 200ms slide-in (spec §10).
export default function MobileMenu({
  open,
  currentHref,
  onClose,
}: {
  open: boolean
  currentHref: string | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  return (
    // The `hidden` ATTRIBUTE alone does not hide this. Its UA rule is
    // `[hidden] { display: none }`, and the `flex` utility that used to sit in
    // this className is an author-origin rule of equal specificity — author
    // beats UA, so the panel stayed displayed at every viewport with the menu
    // "closed", covering the page and swallowing the close button's effect.
    // Display must therefore be toggled by CLASS, not by the attribute.
    // The attribute stays: it is what removes the panel from the
    // accessibility tree and takes its links out of the tab order.
    <div
      id="mobile-menu"
      hidden={!open}
      className={`fixed inset-0 z-[9998] flex-col bg-ink-900 px-5 pb-8 pt-5 motion-safe:transition-transform motion-safe:duration-200 lg:hidden ${
        open ? "flex" : "hidden"
      }`}
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="relative -mr-3 h-12 w-12"
        >
          {/* Gold cross from two rotated 2px spans (spec §3). */}
          <span className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold-500" />
          <span className="absolute left-1/2 top-1/2 block h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-gold-500" />
        </button>
      </div>

      <nav className="mt-4 flex flex-col" aria-label="Main">
        {NAV.map((item) => {
          const isCurrent = currentHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isCurrent ? "page" : undefined}
              className={`border-t border-white/[.14] py-4 font-display text-[30px] font-extrabold uppercase leading-none ${
                isCurrent ? "text-gold-500" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-7 flex flex-col gap-3">
        <Link
          href="/donate"
          onClick={onClose}
          className="bg-gold-500 py-[17px] text-center font-body text-[12px] font-bold uppercase leading-none tracking-[.09em] text-ink-900"
        >
          Donate
        </Link>
        <Link
          href="/programs/apply"
          onClick={onClose}
          className="border border-white/40 py-[17px] text-center font-body text-[12px] font-bold uppercase leading-none tracking-[.09em] text-white"
        >
          Apply as a mentee
        </Link>
      </div>

      <div className="mt-7 border-t border-white/[.14] pt-6">
        <div className="flex flex-col font-body text-[13px] font-semibold text-gold-500">
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className="flex min-h-[44px] items-center"
          >
            {SITE.phone}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex min-h-[44px] items-center"
          >
            {SITE.email}
          </a>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 font-body text-[10px] font-bold uppercase tracking-[.14em] text-white/60">
          {SITE.social.map((s) => (
            <a key={s.label} href={s.url} className="flex min-h-[44px] items-center">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
