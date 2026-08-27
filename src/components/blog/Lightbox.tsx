"use client"

import { useCallback, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { MediaItem } from "@/lib/blog-types"

// Gallery lightbox, spec §4 and §11: a modal dialog with a focus trap, arrow-key
// navigation, Escape to close, and focus returned to the tile that opened it.
//
// Rendered inline rather than through createPortal — it is only mounted when
// open (the parent gates it), so there is no server/client boundary problem of
// the kind that needed a mount guard in book-now-modal.js.

export default function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: MediaItem[]
  index: number
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // Captured on mount so focus can be handed back to whatever opened us.
  const openerRef = useRef<Element | null>(null)

  const go = useCallback(
    (delta: number) => {
      onNavigate((index + delta + images.length) % images.length)
    },
    [index, images.length, onNavigate],
  )

  useEffect(() => {
    openerRef.current = document.activeElement
    closeRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        go(1)
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        go(-1)
        return
      }
      // Focus trap: cycle Tab within the dialog's focusable children.
      if (e.key === "Tab") {
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!nodes || nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
      // Return focus to the opening tile (spec §11).
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
  }, [go, onClose])

  const current = images[index]
  if (!current) return null

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6"
      style={{ background: "rgba(15,22,38,.92)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-5 top-5 rounded-full p-2 text-white"
        style={{ background: "rgba(255,255,255,.12)" }}
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative h-[70vh] w-full max-w-[1100px]">
        <Image
          src={current.url as string}
          alt={current.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <div className="mt-5 flex items-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="rounded-full p-3 text-white"
          style={{ background: "rgba(255,255,255,.12)" }}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        {/* Position is announced, not just shown (spec §11). */}
        <span className="text-[13px] font-semibold text-white" aria-live="polite">
          Photo {index + 1} of {images.length}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="rounded-full p-3 text-white"
          style={{ background: "rgba(255,255,255,.12)" }}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {current.alt ? (
        <p className="mt-3 max-w-[700px] text-center text-[12.5px] font-medium text-white/70">
          {current.alt}
        </p>
      ) : null}
    </div>
  )
}
