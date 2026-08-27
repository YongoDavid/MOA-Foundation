import Image from "next/image"
import Link from "next/link"
import { FOOTER_COLUMNS, SITE } from "@/lib/site"
// TEMPORARY: the redesign's mmf-logo.png (813x951) could not be retrieved —
// the design tool caps file reads at 256 KiB and the PNG exceeds it, so every
// fetch arrives truncated and unreadable by the image pipeline. Falling back
// to the existing mark until the real file is placed at
// src/Images/mmf-logo.png, then change this one import back.
import Logo from "../../Images/Logo1.jpg"

// Spec §3 — ink-900. Two rows above the baseline row.
//
// The logo sits in its OWN full-width row, not in the first grid column. At
// 300px wide it renders 351px tall; inside a grid column that forces a 465px
// row and leaves the three link columns floating above 250px of dead space.
// The spec calls this out explicitly. Do not "tidy" it into the grid.
export default function SiteFooter() {
  return (
    <footer className="bg-ink-900 px-5 pb-9 pt-12 lg:px-14 lg:pb-[38px] lg:pt-[60px]">
      <div className="mx-auto max-w-[1440px]">
        {/* Row 1 — logo and tagline, full width. */}
        <div className="mb-8 flex flex-col items-start gap-8 border-b border-white/[.14] pb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12 lg:pb-10">
          <Image
            src={Logo}
            alt={`${SITE.legalName} — ${SITE.subtitle}`}
            sizes="(max-width: 1024px) 190px, 300px"
            className="h-auto w-[190px] lg:w-[300px]"
            priority={false}
          />
          <p className="m-0 font-display text-[24px] font-extrabold uppercase leading-[1.05] text-white lg:text-right lg:text-[30px]">
            Don&apos;t just belong,
            <br />
            stand out.
          </p>
        </div>

        {/* Row 2 — contact plus three link columns. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-b border-white/[.14] pb-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12 lg:pb-[42px]">
          <div className="col-span-2 lg:col-span-1">
            <h2 className="mb-[18px] font-body text-[10px] font-bold uppercase leading-none tracking-[.16em] text-white/45">
              Contact
            </h2>
            <p className="m-0 max-w-[300px] font-body text-[13px] font-medium leading-[1.65] text-white/60">
              {SITE.address}
            </p>
            <p className="mt-3 font-body text-[13px] font-semibold leading-[1.8] text-gold-500">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              <br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="mb-[18px] font-body text-[10px] font-bold uppercase leading-none tracking-[.16em] text-white/45">
                {col.heading}
              </h2>
              <ul className="m-0 flex list-none flex-col gap-[11px] p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-body text-[13px] font-medium leading-none text-white/[.82] transition-colors duration-150 hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="mb-[18px] font-body text-[10px] font-bold uppercase leading-none tracking-[.16em] text-white/45">
              Follow
            </h2>
            <ul className="m-0 flex list-none flex-col gap-[11px] p-0">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    className="font-body text-[13px] font-medium leading-none text-white/[.82] transition-colors duration-150 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-[26px] font-body text-[11px] font-semibold uppercase leading-none tracking-[.06em] text-white/40 sm:flex-row sm:justify-between">
          <span>© 2026 {SITE.legalName}</span>
          <span>{SITE.location}</span>
        </div>
      </div>
    </footer>
  )
}
