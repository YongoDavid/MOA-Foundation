"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Counts a figure up when it scrolls into view.
 *
 * The SERVER renders the final value, not zero. Three reasons, and all three
 * have bitten this codebase before:
 *   - Someone with JavaScript off must see "300", not "0". A figure that reads
 *     zero without JS is worse than no animation.
 *   - The smoke script greps the server HTML for these numbers.
 *   - Server and first client render must match or hydration fails — the bug
 *     class already fixed three times here.
 *
 * So the first client render also shows the final value, and only after mount
 * does it drop to the start and animate. Setting state in that effect is the
 * point, not an accident.
 *
 * `prefers-reduced-motion` skips the animation entirely and leaves the number
 * where it already is. So does a browser with no IntersectionObserver — the
 * figure stays correct rather than sticking at zero waiting for a callback
 * that will never arrive.
 */
export default function CountUp({
  value,
  suffix = "",
  duration = 1600,
  className,
}: {
  value: number
  suffix?: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (reduced || typeof IntersectionObserver === "undefined") return

    let frame = 0
    let cancelled = false

    // Deliberate setState-in-effect: the number has to be on screen as the
    // real value for the server render, then reset once we know we are on the
    // client and can actually animate it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay(0)

    const run = (startedAt: number) => {
      const step = (now: number) => {
        if (cancelled) return
        const t = Math.min(1, (now - startedAt) / duration)
        // easeOutCubic — fast first, settling rather than stopping dead.
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(Math.round(eased * value))
        if (t < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            io.disconnect()
            run(performance.now())
          }
        }
      },
      // Fires a little before the figure is fully on screen, so the count is
      // already moving by the time it is comfortably readable.
      { threshold: 0.4, rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)

    return () => {
      cancelled = true
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration])

  // One text node, no inner wrapper. An inner <span> around the digits split
  // "300" and "+" across a tag boundary, so the served HTML no longer
  // contained the string "300+" and the smoke assertion for the corrected
  // figure stopped matching. Tabular digits go on the outer span instead.
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {display}
      {suffix}
    </span>
  )
}
