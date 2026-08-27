import Image, { type StaticImageData } from "next/image"
import type { ReactNode } from "react"

// Shared form band — ink-900 panel left, photograph right.
//
// The photograph uses align-self:start with a capped min-height over green-950
// so a portrait image beside a tall form leaves a panel rather than stretching
// (spec §8).
export default function FormSplit({
  eyebrow,
  heading,
  lead,
  image,
  alt,
  minHeight = 700,
  children,
}: {
  eyebrow: string
  heading: string
  lead?: string
  image: StaticImageData
  alt: string
  minHeight?: number
  children: ReactNode
}) {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="bg-ink-900 px-5 py-12 lg:px-14 lg:py-[74px]">
        <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          {eyebrow}
        </p>
        <h2 className="m-0 mb-2.5 mt-4 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[40px]">
          {heading}
        </h2>
        {lead ? (
          <p className="m-0 mb-8 max-w-[430px] font-body text-[14px] font-medium leading-[1.65] text-white/70">
            {lead}
          </p>
        ) : null}
        {children}
      </div>
      <div
        className="relative self-start overflow-hidden bg-green-950"
        style={{ minHeight }}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  )
}
