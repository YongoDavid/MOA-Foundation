import Image, { type StaticImageData } from "next/image"
import { SCRIM } from "@/lib/tokens"

// Photographic section header. Used by homepage bands 01, 03, 05 and 06, and
// by the inner sections of About, Programs and Become a Mentor.
//
// HEIGHT IS A DELIBERATE DEPARTURE FROM THE SPEC. §2 Layout says exactly
// 210px on desktop and 150–170px on mobile. At 210px across 1440 the band
// shows about a fifth of a 3:2 photograph — correctly framed after the focal
// point below, but still a sliver, and the Foundation's reading of it was
// that the pictures looked zoomed in. Raised to 320/270/220 on 15 Oct 2026
// at the client's explicit request, which shows about a third of the frame.
// The focal values each caller passes were re-checked against the new box
// and all still hold; they are not independent of this number.
//
// The scrim comes from the shared constant rather than a hand-written
// gradient: the spec allows exactly three, and centralising them is what stops
// a fourth appearing by accident.
export default function SectionHeader({
  eyebrow,
  heading,
  note,
  image,
  alt,
  focal = "50% 25%",
}: {
  /** e.g. "01 — THE EVIDENCE". Sentence-case in markup; uppercased in CSS. */
  eyebrow: string
  heading: string
  /** Optional right-aligned note, e.g. "As of August 2026". */
  note?: string
  image: StaticImageData
  alt: string
  /**
   * Where to hold the photograph as it is cropped, as a CSS object-position.
   *
   * This band is 150–210px tall and full width, so a 3:2 photograph is cut to
   * roughly a fifth of its height. `object-cover` centres that slice by
   * default, and in every one of these photographs the people stand in the
   * UPPER third — so the default showed torsos and cropped the faces off the
   * top. Each caller passes the band that holds its own subject, measured
   * from the actual file rather than guessed.
   *
   * It is an inline style, not a class: Tailwind's scanner cannot see a class
   * name assembled at runtime, so a prop-driven utility would silently not
   * be emitted.
   */
  focal?: string
}) {
  return (
    // min-h + in-flow content, for the same reason as Hero: an absolutely
    // positioned overlay cannot make its box taller, so a longer heading
    // silently spills out over the neighbouring sections.
    <div className="relative flex min-h-[220px] items-end bg-ink-900 md:min-h-[270px] lg:min-h-[320px]">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: focal }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: SCRIM.mobile }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: SCRIM.sectionHeader }}
      />
      {/* The same 1440 wrapper the header and the content bands use. Without
          it this heading sat at the screen edge while the band under it
          stopped at 1440. */}
      <div className="pointer-events-none relative z-[1] w-full px-5 pb-6 pt-10 lg:px-14 lg:pb-8">
      <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6">
        <div>
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
            {eyebrow}
          </p>
          <h2 className="m-0 mt-3 font-display text-[32px] font-extrabold uppercase leading-[.95] text-white lg:mt-3.5 lg:text-[54px]">
            {heading}
          </h2>
        </div>
        {note ? (
          <span className="hidden shrink-0 font-body text-[11px] font-semibold uppercase leading-none tracking-[.12em] text-white/[.62] md:block">
            {note}
          </span>
        ) : null}
      </div>
      </div>
    </div>
  )
}
