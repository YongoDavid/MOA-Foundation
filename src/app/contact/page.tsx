import Image from "next/image"
import ActionCards from "@/components/bands/ActionCards"
import ContactForm from "@/components/forms/ContactForm"
import { SITE } from "@/lib/site"
import { SCRIM } from "@/lib/tokens"

import VisitImage from "../../Images/MOA4.jpg"

export const metadata = {
  title: "Contact",
  description:
    "Write to the Moses Mentoring Foundation about mentoring, volunteering, partnership or giving. Our office is in Apo, Abuja, F.C.T.",
  alternates: { canonical: "/contact" },
}

// Contact has NO photographic hero (contact mockup) — the details themselves
// open the page. That is deliberate: someone arriving here wants the email
// address, and putting 440px of photograph above it pushes the one thing they
// came for below the fold.
const DETAILS = [
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}`, accent: true },
  { label: "Phone", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
  { label: "Office", value: "House B61 Supercell Estate,\nApo, Abuja, F.C.T., Nigeria" },
  { label: "Hours", value: SITE.officeHours },
]

const NEXT_STEPS = [
  {
    title: "Apply as a mentee",
    body: "Open to young Africans wherever you are.",
    action: { label: "Start an application", href: "/programs/apply" },
  },
  {
    title: "Mentor a group",
    body: "Share your experience with young people who need it.",
    action: { label: "Become a mentor", href: "/programs/mentor" },
  },
  {
    title: "Partner with us",
    body: "For organisations funding a programme area or a full cohort.",
    action: { label: "Request the brief", href: "/contact" },
    dark: true,
  },
]

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Supercell Estate, Apo, Abuja, Nigeria")

export default function ContactPage() {
  return (
    <>
      <section className="bg-paper px-5 pb-12 pt-12 lg:px-14 lg:pb-0 lg:pt-[70px]">
        <div className="mx-auto grid max-w-[1440px] items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              Contact
            </p>
            <h1 className="m-0 mt-[18px] font-display text-[46px] font-black uppercase leading-[.92] text-ink-900 [text-wrap:balance] lg:text-[70px]">
              Talk to the
              <br />
              <span className="text-umber-600">Foundation</span>.
            </h1>
            <p className="m-0 mt-[22px] max-w-[470px] font-body text-[16px] font-medium leading-[1.7] text-ink-600">
              Whether you want to be mentored, to mentor, to partner or to give,
              write to us and a person will reply. We answer every message.
            </p>

            <dl className="m-0 mt-9">
              {DETAILS.map((d, i) => (
                <div
                  key={d.label}
                  className={`grid grid-cols-1 items-baseline gap-2 border-t border-ink-900/[.16] py-5 sm:grid-cols-[130px_1fr] sm:gap-5 ${
                    i === DETAILS.length - 1 ? "border-b" : ""
                  }`}
                >
                  <dt className="font-body text-[10.5px] font-bold uppercase leading-[1.6] tracking-[.14em] text-ink-400">
                    {d.label}
                  </dt>
                  <dd
                    className={`m-0 whitespace-pre-line font-body ${
                      d.href
                        ? "text-[17px] font-semibold leading-[1.4]"
                        : "text-[15.5px] font-medium leading-[1.6] text-ink-700"
                    } ${d.accent ? "text-umber-600" : d.href ? "text-ink-900" : ""}`}
                  >
                    {d.href ? (
                      <a href={d.href} className="underline-offset-4 hover:underline">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="m-0 mt-7 flex list-none flex-wrap gap-2.5 p-0">
              {SITE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    className="inline-flex min-h-[44px] items-center border border-ink-900/20 px-[18px] font-body text-[11px] font-bold uppercase leading-none tracking-[.09em] text-ink-600 transition-colors duration-150 hover:border-ink-900 hover:text-ink-900"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-900 px-5 py-10 lg:p-11">
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
              Send a message
            </p>
            <h2 className="m-0 mb-[26px] mt-3.5 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[34px]">
              How can we help?
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 pt-12 lg:px-14 lg:pt-[70px]">
        <div className="relative mx-auto h-[300px] max-w-[1440px] overflow-hidden bg-green-950 lg:h-[340px]">
          <Image
            src={VisitImage}
            alt="The Foundation delegation at the Embassy of the State of Kuwait in Abuja"
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
            // The mockup draws this band's scrim a few percent lighter than
            // the section-header one. Not enough to be visible, and the spec
            // caps the scrim set on purpose — reuse beats a sixth near-copy.
            style={{ background: SCRIM.sectionHeader }}
          />
          <div className="absolute inset-y-0 left-5 flex max-w-[480px] flex-col justify-center pr-5 lg:left-11 lg:pr-0">
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
              Visit us
            </p>
            <h2 className="m-0 mt-3.5 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[40px]">
              Our office in Apo,
              <br />
              Abuja
            </h2>
            <p className="m-0 mt-4 font-body text-[14.5px] font-medium leading-[1.65] text-white/[.78]">
              Call ahead and we will make sure someone is there to meet you.
            </p>
            <div className="mt-6">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center bg-gold-500 px-6 font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200"
              >
                Open in maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <ActionCards cards={NEXT_STEPS} />
    </>
  )
}
