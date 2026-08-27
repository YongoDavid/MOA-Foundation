import Image, { type StaticImageData } from "next/image"
import { VALUES } from "@/lib/content"

// About band 02 — `1fr 1fr` on green-950. Five numbered values with sub-copy
// on ink-900, photograph right at 640px capped with align-self:start.
//
// The ordinal colour is outside the nineteen-token palette: the mockup uses a
// muted green-grey here rather than the mauve used on the homepage vision
// list, because this panel sits against green-950 rather than pure ink. Kept
// local, not promoted.
const ORDINAL_MUTED = "#7A8A80"

export default function ValuesSplit({
  image,
  alt,
}: {
  image: StaticImageData
  alt: string
}) {
  return (
    <section className="grid bg-green-950 lg:grid-cols-2">
      <div className="bg-ink-900 px-5 py-12 lg:px-14 lg:py-[78px]">
        <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          02 — What guides us
        </p>
        <h2 className="m-0 mb-7 mt-4 font-display text-[32px] font-extrabold uppercase leading-[1.02] text-white lg:text-[42px]">
          Five values
        </h2>
        <ol className="m-0 flex list-none flex-col p-0">
          {VALUES.map((v, i) => (
            <li
              key={v.name}
              className={`flex gap-[18px] border-t border-white/[.16] py-[18px] ${
                i === VALUES.length - 1 ? "border-b" : ""
              }`}
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-body text-[10.5px] font-semibold leading-[1.8]"
                style={{ color: ORDINAL_MUTED }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="m-0 font-body text-[16px] font-bold leading-[1.4] text-white">
                  {v.name}
                </h3>
                <p className="m-0 mt-1 font-body text-[13.5px] font-medium leading-[1.6] text-white/65">
                  {v.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative h-[320px] self-start overflow-hidden bg-green-950 lg:h-[640px]">
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
