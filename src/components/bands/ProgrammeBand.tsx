import Image from "next/image"
import Link from "next/link"
import type { Programme } from "@/lib/programmes"

// One programme area (spec §5). Odd bands put copy left on paper; even bands
// put media left with copy on panel.
export default function ProgrammeBand({ programme }: { programme: Programme }) {
  const even = programme.index % 2 === 0
  const chipGround = even ? "bg-paper" : "bg-panel"

  const copy = (
    <div className={`px-5 py-12 lg:px-14 lg:py-[74px] ${even ? "bg-panel" : ""}`}>
      <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
        {String(programme.index).padStart(2, "0")} — {programme.name}
      </p>
      <h2 className="m-0 mt-4 font-display text-[34px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[46px]">
        {programme.heading.split("\n").map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </h2>
      <p className="m-0 mt-5 max-w-[520px] font-body text-[15px] font-medium leading-[1.7] text-ink-600">
        {programme.body}
      </p>

      <ul className="m-0 mt-6 flex list-none flex-wrap gap-2.5 p-0">
        {programme.sdgs.map((n) => (
          <li
            key={n}
            className={`px-3.5 py-[9px] font-body text-[10.5px] font-bold uppercase leading-none tracking-[.1em] text-umber-800 ${chipGround}`}
          >
            SDG {String(n).padStart(2, "0")}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap gap-3">
        {programme.actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`px-6 py-[15px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] transition-colors duration-150 ${
              a.variant === "primary"
                ? "bg-ink-900 text-white hover:bg-green-900"
                : "border border-ink-900/[.22] text-ink-900 hover:border-ink-900"
            }`}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )

  const media =
    programme.media.kind === "photo" ? (
      <div className="relative min-h-[260px] self-stretch overflow-hidden bg-green-950 lg:min-h-[420px]">
        <Image
          src={programme.media.image}
          alt={programme.media.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    ) : (
      // No photograph exists for this programme. A typographic panel rather
      // than an unrelated image (spec §5) — keep it until real photography
      // arrives.
      <div className="flex min-h-[260px] flex-col justify-end self-stretch bg-green-900 px-8 py-12 lg:min-h-[420px] lg:px-12 lg:py-14">
        <span aria-hidden="true" className="h-[3px] w-11 bg-gold-500" />
        <p className="m-0 mt-6 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
          {programme.media.eyebrow}
        </p>
        <p className="m-0 mt-4 max-w-[380px] font-body text-[20px] font-semibold leading-[1.4] text-white [text-wrap:pretty] lg:text-[26px]">
          {programme.media.statement}
        </p>
      </div>
    )

  return (
    <section
      id={programme.slug}
      className="grid scroll-mt-24 border-b border-ink-900/[.14] lg:grid-cols-2"
    >
      {even ? (
        <>
          <div className="order-2 lg:order-1">{media}</div>
          <div className="order-1 lg:order-2">{copy}</div>
        </>
      ) : (
        <>
          {copy}
          {media}
        </>
      )}
    </section>
  )
}
