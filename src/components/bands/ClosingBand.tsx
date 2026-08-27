import Link from "next/link"

// Reusable closing band on green-900. About, Programs and Contact each end
// with one; the copy and actions differ, the treatment does not.
export default function ClosingBand({
  heading,
  body,
  actions,
}: {
  heading: string
  body?: string
  actions: { label: string; href: string; variant: "primary" | "outline" }[]
}) {
  return (
    <section className="bg-green-900 px-5 py-12 lg:px-14 lg:py-16">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
        <div>
          <h2 className="m-0 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[40px]">
            {heading.split("\n").map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          {body ? (
            <p className="m-0 mt-3.5 max-w-[520px] font-body text-[15px] font-medium leading-[1.65] text-white/75">
              {body}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
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
      </div>
    </section>
  )
}
