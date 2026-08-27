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
}) {
  const h =
    height === "home"
      ? "h-[380px] md:h-[500px] lg:h-[600px]"
      : "h-[300px] md:h-[380px] lg:h-[440px]"

  return (
    <section className={`relative bg-ink-900 ${h}`}>
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

      <div className="absolute inset-y-0 left-5 flex max-w-[720px] flex-col justify-center pr-5 lg:left-14 lg:pr-0">
        <p className="m-0 flex items-center gap-3 font-body text-[10px] font-bold uppercase leading-none tracking-[.18em] text-gold-500 lg:text-[10.5px]">
          <span aria-hidden="true" className="h-px w-[30px] bg-gold-500" />
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
