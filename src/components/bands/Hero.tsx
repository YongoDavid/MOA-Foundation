import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { SCRIM } from "@/lib/tokens"

// Page hero. 600px on the homepage, 400–440px on inner pages (spec §5).
export default function Hero({
  eyebrow,
  headline,
  accent,
  lead,
  actions,
  image,
  alt,
  height = "home",
  repeatTagline = false,
  eyebrowRule = true,
}: {
  eyebrow: string
  /** Rendered before `accent`; use \n for the line break. */
  headline: string
  /** Trailing words shown in gold, e.g. "Excellence." */
  accent?: string
  lead?: string
  actions?: { label: string; href: string; variant: "primary" | "outline" }[]
  image: StaticImageData
  alt: string
  height?: "home" | "page"
  /** Homepage only — the tagline repeated bottom-right. */
  repeatTagline?: boolean
  /** Homepage carries a 30px gold rule before the eyebrow; inner pages do not. */
  eyebrowRule?: boolean
}) {
  // MIN-height, not height, and the text sits in normal flow rather than
  // absolutely positioned inside the box.
  //
  // It used to be `h-[300px]` with the copy in an `absolute inset-y-0` layer.
  // Absolutely positioned children contribute nothing to their parent's
  // height, so any hero whose copy grew past the fixed box simply spilled out
  // of it — above and below, over the sections either side. /programs/mentor
  // did exactly that at 390px: a four-line headline, a five-line lead and two
  // rows of buttons needed ~414px inside a 300px box.
  //
  // With min-h the section grows to fit instead. `justify-center` still
  // centres the copy whenever there is spare room, so nothing changes on the
  // wider viewports where there always is.
  const h =
    height === "home"
      ? "min-h-[380px] md:min-h-[500px] lg:min-h-[600px]"
      : "min-h-[300px] md:min-h-[380px] lg:min-h-[440px]"

  return (
    <section className={`relative flex bg-ink-900 ${h}`}>
      <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: SCRIM.mobile }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{ background: SCRIM.hero }}
      />

      <div className="relative z-[1] flex w-full flex-col justify-center px-5 py-14 lg:px-14 lg:py-0">
       <div className="max-w-[720px]">
        <p
          className={`m-0 flex items-center gap-3 font-body uppercase leading-none ${
            eyebrowRule
              ? "text-[10px] font-bold tracking-[.18em] text-gold-500 lg:text-[10.5px]"
              : "text-[11px] font-semibold tracking-[.14em] text-white/60"
          }`}
        >
          {eyebrowRule ? (
            <span aria-hidden="true" className="h-px w-[30px] bg-gold-500" />
          ) : null}
          {eyebrow}
        </p>

        <h1 className="m-0 mt-4 font-display text-[42px] font-black uppercase leading-[.9] tracking-[-.005em] text-white [text-wrap:balance] md:text-[62px] lg:mt-[22px] lg:text-[86px]">
          {headline.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
          {accent ? <span className="text-gold-500">{accent}</span> : null}
        </h1>

        {lead ? (
          <p className="m-0 mt-5 max-w-[520px] font-body text-[14px] font-medium leading-[1.6] text-white/80 lg:mt-[26px] lg:text-[17px] lg:leading-[1.65]">
            {lead}
          </p>
        ) : null}

        {actions?.length ? (
          <div className="mt-7 flex flex-wrap gap-3 lg:mt-[34px]">
            {actions.map((a) => (
              <Link
                key={a.href + a.label}
                href={a.href}
                className={`px-6 py-4 font-body text-[11px] font-bold uppercase leading-none tracking-[.09em] transition-colors duration-150 lg:px-7 lg:py-[17px] lg:text-[12px] ${
                  a.variant === "primary"
                    ? "bg-gold-500 text-ink-900 hover:bg-gold-200"
                    : "border border-white/40 text-white hover:border-white"
                }`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        ) : null}
       </div>
      </div>

      {repeatTagline ? (
        // Decorative repetition — the tagline already appears as the eyebrow.
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[34px] right-14 m-0 hidden text-right font-body text-[10.5px] font-semibold uppercase leading-[1.7] tracking-[.1em] text-white/50 lg:block"
        >
          Don&apos;t just belong,
          <br />
          stand out.
        </p>
      ) : null}
    </section>
  )
}
