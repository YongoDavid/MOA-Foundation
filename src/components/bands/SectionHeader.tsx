import Image, { type StaticImageData } from "next/image"
import { SCRIM } from "@/lib/tokens"

// Photographic section header — exactly 210px desktop, 150–170px mobile
// (spec §2 Layout). Used by homepage bands 01, 03, 05 and 06, and by the
// inner sections of About, Programs and Become a Mentor.
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
}: {
  /** e.g. "01 — THE EVIDENCE". Sentence-case in markup; uppercased in CSS. */
  eyebrow: string
  heading: string
  /** Optional right-aligned note, e.g. "As of August 2026". */
  note?: string
  image: StaticImageData
  alt: string
}) {
  return (
    // min-h + in-flow content, for the same reason as Hero: an absolutely
    // positioned overlay cannot make its box taller, so a longer heading
    // silently spills out over the neighbouring sections.
    <div className="relative flex min-h-[150px] items-end bg-ink-900 md:min-h-[180px] lg:min-h-[210px]">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="100vw"
        className="object-cover"
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
      <div className="pointer-events-none relative z-[1] flex w-full items-end justify-between gap-6 px-5 pb-6 pt-10 lg:px-14 lg:pb-8">
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
  )
}
