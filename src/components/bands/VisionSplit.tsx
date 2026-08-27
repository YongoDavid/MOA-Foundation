import Image, { type StaticImageData } from "next/image"
import { FLAGS, VISION, VISION_ITEMS } from "@/lib/content"

// Spec §4 band 04 — `1fr 1fr` on green-950. Verbatim vision behind a 2px gold
// rule, then the eight numbered items with a pull-quote woven in after item
// four (behind showQuotes).
//
// The photograph uses align-self:start with a capped height and green-950
// behind it, so a portrait image beside a tall text column leaves a panel
// rather than a stretched image or a gap. Spec §8 records this as a real
// defect in an earlier draft.
//
// The item ordinal is the one value outside the nineteen-token palette — the
// mockup's muted mauve on ink-900. Kept local, not promoted.
const ORDINAL_MUTED = "#7A6F80"

export default function VisionSplit({
  image,
  alt,
}: {
  image: StaticImageData
  alt: string
}) {
  const quoteAfter = 4

  return (
    <section className="grid bg-green-950 lg:grid-cols-2">
      <div className="bg-ink-900 px-5 py-12 lg:px-14 lg:py-20">
        <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          04 — Our vision
        </p>
        <h2 className="m-0 mb-[18px] mt-4 font-display text-[32px] font-extrabold uppercase leading-[1.02] text-white lg:text-[42px]">
          Eight things we are
          <br />
          building toward
        </h2>

        {/* Verbatim — read from content.ts, shared with /about. */}
        <p className="m-0 mb-7 border-l-2 border-gold-500 pl-4 font-body text-[14px] font-medium leading-[1.66] text-white/[.82] [text-wrap:pretty] lg:text-[14.5px]">
          {VISION}
        </p>

        <ol className="m-0 flex list-none flex-col p-0">
          {VISION_ITEMS.map((item, i) => (
            <li key={i}>
              <div className="flex gap-4 border-t border-white/[.16] py-[15px]">
                <span
                  aria-hidden="true"
                  className="shrink-0 font-body text-[10.5px] font-semibold leading-[1.6]"
                  style={{ color: ORDINAL_MUTED }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-body text-[13.5px] font-semibold leading-[1.55] text-white">
                  {item}
                </span>
              </div>

              {FLAGS.showQuotes && i + 1 === quoteAfter ? (
                <figure className="my-[22px] border-l-[3px] border-gold-500 bg-green-quote px-6 py-[22px]">
                  <blockquote className="m-0 font-body text-[17px] font-medium leading-[1.55] text-white [text-wrap:pretty] lg:text-[19px]">
                    &ldquo;I came in able to speak. I left able to decide. That is
                    the difference the programme made.&rdquo;
                  </blockquote>
                  <figcaption className="mt-3.5 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.14em] text-gold-500">
                    Cohort 3 mentee · Abuja
                  </figcaption>
                </figure>
              ) : null}

              {i === VISION_ITEMS.length - 1 ? (
                <div aria-hidden="true" className="border-t border-white/[.16]" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="relative h-[320px] self-start overflow-hidden bg-green-950 lg:h-[820px]">
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
