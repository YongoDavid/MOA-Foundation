"use client"

import { useState } from "react"

/**
 * Share and Copy link.
 *
 * These were <span>s carrying a comment saying they were "presentational in
 * the prototype" — the same shape as the Reply control that shipped doing
 * nothing. A thing styled as a button and labelled with a verb is a promise.
 *
 * Share uses the Web Share API where it exists, which on a phone is the native
 * sheet. Where it does not — most desktop browsers — it falls back to copying,
 * because an inert button is worse than a slightly different action.
 */
export default function PostActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be refused (insecure origin, permissions).
      // Say nothing rather than claim a copy that did not happen.
      setCopied(false)
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
        return
      } catch {
        // The sheet was dismissed. Not an error, and not a reason to then
        // copy something the reader did not ask for.
        return
      }
    }
    await copy()
  }

  const cls =
    "min-h-[44px] border border-ink-900/[.18] px-[15px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.08em] text-ink-600 transition-colors duration-150 hover:border-ink-900 hover:text-ink-900"

  return (
    <div className="ml-auto flex gap-2">
      <button type="button" onClick={share} className={cls}>
        Share
      </button>
      <button type="button" onClick={copy} className={cls}>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  )
}
