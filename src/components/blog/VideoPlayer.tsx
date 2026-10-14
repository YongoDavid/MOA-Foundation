"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import PlayBadge from "./PlayBadge"
import { formatDuration } from "@/lib/blog-format"
import type { MediaItem } from "@/lib/blog-types"

/**
 * Video block, mockup 1b — a real player as of Phase 4.
 *
 * It used to be a picture of a player: a poster, a play badge and a painted
 * scrub bar stuck at 22%, with no source and nothing to play. That shipped
 * deliberately while there was no media pipeline, and it is gone.
 *
 * THREE THINGS ARE LOAD-BEARING HERE.
 *
 * `preload="none"` — storage egress on this plan is 5GB a month, and a 40MB
 * video that preloads for every visitor who scrolls past spends the whole
 * allowance on people who never pressed play. Nothing is fetched until
 * someone asks for it. This is also why the duration is rendered from the
 * stored number rather than read from the file: reading it would mean
 * fetching the file's metadata on page load, which is the cost we are
 * avoiding.
 *
 * No autoplay (spec §12, acceptance criterion 5). It never had one because it
 * could not play at all; now that it can, the absence is a decision.
 *
 * `playsInline` — without it iOS Safari takes the video fullscreen the moment
 * it starts, which throws the reader out of the article.
 */
export default function VideoPlayer({
  src,
  poster,
  durationSeconds,
  caption,
}: {
  src: string
  poster: MediaItem
  durationSeconds: number
  caption?: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  // A video block with no file renders nothing rather than an empty frame
  // with a play button that does nothing. savePost refuses to publish one,
  // so this covers rows written before that guard existed.
  if (!src) return null

  // A poster can be a static import (the fixtures) or a storage URL (an
  // uploaded one). The <video poster> attribute only takes a string.
  const posterUrl =
    typeof poster.url === "string" ? poster.url : poster.url?.src

  // THE FRAME TAKES THE VIDEO'S SHAPE, not a fixed 340px box.
  //
  // A fixed landscape box is wrong at both ends. On a phone a 16:9 clip sat
  // inside it with a black band above and below; on a desktop the same clip
  // was pillarboxed and rendered SMALLER than the column it sits in. And
  // phone footage is usually shot upright, which that box reduced to a
  // narrow strip. The poster carries the real dimensions, so use them.
  const ratio =
    poster.width > 0 && poster.height > 0 ? poster.width / poster.height : 16 / 9
  // An upright video would otherwise be taller than the screen it is read on.
  const portrait = ratio < 1

  const start = () => {
    setStarted(true)
    void ref.current?.play()
  }

  return (
    <figure className="m-0">
      <div
        className={`relative max-h-[78vh] overflow-hidden bg-green-950 ${
          portrait ? "mx-auto w-full max-w-[420px]" : "w-full"
        }`}
        style={{ aspectRatio: ratio }}
      >
        <video
          ref={ref}
          src={src}
          poster={posterUrl || undefined}
          controls
          preload="none"
          playsInline
          onPlay={() => setStarted(true)}
          className="h-full w-full object-contain"
        >
          {/* Shown only if the browser cannot play the file at all — an HEVC
              export that slipped past the editor's warning, most likely. */}
          <a href={src} download>
            Download the video
          </a>
        </video>

        {/* The designed poster treatment sits on top until playback begins.
            The native poster attribute is set too, so a reader who uses the
            browser's own controls still sees the still frame. */}
        {!started ? (
          <button
            type="button"
            onClick={start}
            aria-label={`Play the video${caption ? `: ${caption}` : ""}`}
            className="absolute inset-0 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-500"
          >
            {posterUrl ? (
              <Image
                src={poster.url}
                alt={poster.alt}
                fill
                sizes="(max-width: 768px) 100vw, 760px"
                className="object-contain"
              />
            ) : null}
            <span className="relative">
              <PlayBadge size={66} />
            </span>
            {durationSeconds > 0 ? (
              <span className="absolute bottom-3 right-3 bg-ink-900/70 px-2 py-1 font-body text-[11px] font-semibold leading-none text-white">
                {formatDuration(durationSeconds)}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="mt-[10px] font-body text-[12px] font-medium leading-[1.5] text-ink-500">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
