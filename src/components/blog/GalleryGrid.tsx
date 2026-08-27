"use client"

import { useState } from "react"
import Image from "next/image"
import type { MediaItem } from "@/lib/blog-types"
import Lightbox from "./Lightbox"

// Gallery block, mockup 1b. Spec §4: 2x2 grid, the first tile spans both rows,
// 150px rows. The overflow tile is an opaque umber panel showing "+N".
//
// `total` is the post's real photo count. Fixtures now derive `mediaCount`
// from the gallery set itself, so the badge, the "+N" tile and the lightbox
// all agree — an earlier revision advertised 18 photographs over a set of
// three, and the "+15" tile opened a lightbox containing three.
//
// The lightbox receives the FULL set, not the three visible tiles. It used to
// receive `visible`, so "+N" opened a gallery that could not reach the photos
// it had just promised.

export default function GalleryGrid({
  images,
  total,
}: {
  images: MediaItem[]
  /** Real photo count; defaults to the number supplied. */
  total?: number
}) {
  const [open, setOpen] = useState<number | null>(null)
  const visible = images.slice(0, 3)
  const realTotal = total ?? images.length
  const overflow = Math.max(0, realTotal - visible.length)

  if (visible.length === 0) return null

  return (
    <>
      <div
        className="mb-3 grid gap-[10px]"
        style={{
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "150px 150px",
        }}
      >
        {visible.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${realTotal}: ${img.alt}`}
            className="relative overflow-hidden "
            style={i === 0 ? { gridRow: "span 2" } : undefined}
          >
            <Image
              src={img.url as string}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 380px"
              className="object-cover"
            />
          </button>
        ))}

        {overflow > 0 ? (
          <button
            type="button"
            onClick={() => setOpen(visible.length)}
            aria-label={`Open the full gallery, ${realTotal} photos`}
            className="relative overflow-hidden "
          >
            <span
              className="absolute inset-0 flex items-center justify-center text-[17px] font-extrabold leading-none text-white"
              style={{ background: "rgba(91,74,46,.86)" }}
            >
              +{overflow}
            </span>
          </button>
        ) : null}
      </div>

      <p
        className="mb-[30px] text-[12px] font-medium leading-[1.5]"
        style={{ color: "#857C86" }}
      >
        Tap any photo to open the full gallery.
      </p>

      {open !== null ? (
        <Lightbox
          images={images}
          index={open}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
        />
      ) : null}
    </>
  )
}
