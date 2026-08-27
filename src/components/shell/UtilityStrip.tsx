import { SITE } from "@/lib/site"

// Spec §3 — 38px green-900. Hidden below 900px; on mobile a 32px centred
// strip carries the location only, and phone/email move into the open menu.
export default function UtilityStrip() {
  return (
    <div className="bg-green-900">
      {/* Desktop: location left, contact right. */}
      <div className="mx-auto hidden h-[38px] max-w-[1440px] items-center justify-between px-14 font-body text-[11px] font-semibold uppercase leading-none tracking-[.09em] text-white/[.66] min-[900px]:flex">
        <span>{SITE.location}</span>
        <div className="flex gap-[26px]">
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-white">
            {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="hover:text-white">
            {SITE.email}
          </a>
        </div>
      </div>
      {/* Mobile: location only. */}
      <div className="flex h-8 items-center justify-center px-5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[.09em] text-white/[.66] min-[900px]:hidden">
        {SITE.location}
      </div>
    </div>
  )
}
