import Image from "next/image"
import type { MediaItem } from "@/lib/blog-types"
import PlayBadge from "./PlayBadge"

// Video block, mockup 1b.
//
// PROTOTYPE LIMITATION: renders the poster frame, the centred play badge and
// the scrub bar exactly as designed, but there is no video source and it
// cannot play. The spec's poster-until-interaction behaviour is honoured by
// default; wiring a real <video> belongs with the media pipeline in Plan 3.
//
// Never autoplays (spec §12, acceptance criterion 5) — there is nothing to
// autoplay, and the production version must keep it that way.

export default function VideoPlayer({
  poster,
  duration,
  caption,
}: {
  poster: MediaItem
  duration: string
  caption?: string
}) {
  return (
    <figure className="m-0">
      <div className="relative h-[340px] overflow-hidden ">
        <Image
          src={poster.url as string}
          alt={poster.alt}
          fill
          sizes="(max-width: 768px) 100vw, 760px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <PlayBadge size={66} />
        </div>

        {/* Scrub bar — presentational. Amber progress per spec §3. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-center gap-3 px-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,16,24,0), rgba(20,16,24,.7))",
          }}
        >
          <div
            className="h-1 flex-1 "
            style={{ background: "rgba(255,255,255,.3)" }}
          >
            <div
              className="h-full "
              style={{ width: "22%", background: "#C99A45" }}
            />
          </div>
          <span className="text-[11px] font-semibold leading-none text-white">
            0:36 / {duration}
          </span>
        </div>
      </div>
      {caption ? (
        <figcaption
          className="mt-[10px] text-[12px] font-medium leading-[1.5]"
          style={{ color: "#857C86" }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
