"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Logo1 from "../Images/Logo1.jpg"
import { SITE } from "@/lib/site"

// Landing-page preloader: heartbeat logo plus rotating encouragement.
//
// Rendered in the SERVER HTML and removed after mount, rather than mounted on
// the client. Mounting it client-side would flash the homepage first, which is
// the opposite of what a preloader is for. Because the initial state is
// deterministic (visible, first message), server and client agree and there is
// no hydration mismatch — the trap this codebase has hit three times.
//
// Two ways out, so nobody can get stuck behind it:
//   1. window "load" fires -> dismiss as soon as MIN_MS has elapsed
//   2. MAX_MS hard cap -> dismiss regardless
// A <noscript> rule in globals.css hides it entirely without JavaScript.

const MESSAGES = [
  "Almost ready",
  "Gathering the stories",
  "Where leaders rise",
  "Don't just belong, stand out",
] as const

/** Minimum on-screen time — below this it reads as a flicker, not a welcome. */
const MIN_MS = 3000
/** Hard ceiling. A preloader that outstays this is just an obstacle. */
const MAX_MS = 5200
/** Four messages at this cadence fill roughly one pass over the 3s minimum. */
const MESSAGE_MS = 900

export default function Preloader() {
  const [hidden, setHidden] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    // Honour prefers-reduced-motion by dismissing almost immediately: the
    // animation is the whole point, so without it there is nothing to show.
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      ?.matches
    const started = Date.now()

    const dismiss = () => {
      setLeaving(true)
      window.setTimeout(() => setHidden(true), 450)
    }

    if (reduced) {
      dismiss()
      return
    }

    const rotate = window.setInterval(
      () => setMessageIndex((i) => (i + 1) % MESSAGES.length),
      MESSAGE_MS,
    )

    const onLoad = () => {
      const elapsed = Date.now() - started
      window.setTimeout(dismiss, Math.max(0, MIN_MS - elapsed))
    }

    if (document.readyState === "complete") {
      onLoad()
    } else {
      window.addEventListener("load", onLoad, { once: true })
    }

    const hardStop = window.setTimeout(dismiss, MAX_MS)

    return () => {
      window.clearInterval(rotate)
      window.clearTimeout(hardStop)
      window.removeEventListener("load", onLoad)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={`moa-preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Loading the ${SITE.legalName} website`}
    >
      <div className="moa-preloader__inner">
        <div className="moa-preloader__logo">
          <Image
            src={Logo1}
            alt=""
            priority
            sizes="(max-width: 640px) 140px, 190px"
            className="h-[140px] w-auto sm:h-[190px]"
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Decorative — the pill already announces progress to screen readers
            via the wrapper's role="status". */}
        <div className="moa-preloader__spinner" aria-hidden="true" />

        <span className="moa-preloader__pill">{MESSAGES[messageIndex]}</span>
      </div>
    </div>
  )
}
