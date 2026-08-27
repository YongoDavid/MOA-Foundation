import ActionCards from "@/components/bands/ActionCards"
import Hero from "@/components/bands/Hero"
import DonateForm from "@/components/forms/DonateForm"
import { GIVING_AREAS } from "@/lib/content"

import HeroImage from "../../Images/MOA3.jpg"

export const metadata = {
  title: "Support the work",
  description:
    "Gifts of any size go directly to mentoring, education access and peace advocacy. No payment is taken on this website — get in touch and the team will send you what you need.",
  alternates: { canonical: "/donate" },
}

const OTHER_WAYS = [
  {
    title: "Fundraise for us",
    body: "Mark a birthday, a wedding or a workplace drive by raising toward a programme area.",
    action: { label: "Tell us your plan", href: "/contact" },
  },
  {
    title: "In kind",
    body: "Books, learning materials, venue space or professional time given free.",
    action: { label: "Talk to us", href: "/contact" },
  },
  {
    title: "Institutional partnership",
    body: "For organisations funding a programme area or a full cohort.",
    action: { label: "Request the brief", href: "/contact" },
    dark: true,
  },
]

export default function DonatePage() {
  return (
    <>
      <Hero
        eyebrow="Support the work"
        eyebrowRule={false}
        headline={"Fund a young\nAfrican's "}
        accent="start."
        lead="Gifts of any size go directly to mentoring, education access and peace advocacy. Reach out and we will tell you exactly how, and report back on what it funded."
        image={HeroImage}
        alt="In discussion at the Embassy of Vietnam in Abuja"
        height="page"
      />

      <div className="grid lg:grid-cols-[1fr_460px]">
        <section className="border-b border-ink-900/[.14] bg-paper px-5 py-12 lg:border-b-0 lg:border-r lg:px-14 lg:py-[74px]">
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
            01 — Where it goes
          </p>
          <h2 className="m-0 mb-[26px] mt-4 font-display text-[32px] font-extrabold uppercase leading-[.98] text-ink-900 lg:text-[44px]">
            Three things your
            <br />
            gift pays for
          </h2>

          <ol className="m-0 list-none p-0">
            {GIVING_AREAS.map((item, i) => (
              <li
                key={item.title}
                className={`grid grid-cols-[auto_1fr] items-start gap-[22px] border-t border-ink-900/[.16] py-[22px] ${
                  i === GIVING_AREAS.length - 1 ? "border-b" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-[15px] font-extrabold leading-[1.4] text-umber-600"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="m-0 font-body text-[17px] font-bold leading-[1.4] text-ink-900">
                    {item.title}
                  </h3>
                  <p className="m-0 mt-[7px] max-w-[560px] font-body text-[14px] font-medium leading-[1.65] text-ink-500">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="m-0 mt-[34px] max-w-[700px] border-l-[3px] border-umber-600 bg-panel px-7 py-6 font-body text-[16px] font-medium leading-[1.55] text-ink-700 [text-wrap:pretty] lg:text-[18px]">
            Every cycle we publish what came in, what it funded, and how many
            young people it reached. Ask for the last report and we will send
            it.
          </p>
        </section>

        <section className="bg-green-900 px-5 py-12 lg:px-11 lg:py-[74px]">
          <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-gold-500">
            02 — Give
          </p>
          <h2 className="m-0 mb-[18px] mt-4 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[34px]">
            Get in touch
            <br />
            to give
          </h2>
          <p className="m-0 mb-6 font-body text-[14px] font-medium leading-[1.65] text-white/75">
            Leave your details and a member of the team will contact you with
            everything you need to give — including our account details and the
            current areas of need.
          </p>
          <DonateForm />
        </section>
      </div>

      <ActionCards
        eyebrow="03 — Beyond a gift"
        heading={"Other ways\nto help"}
        cards={OTHER_WAYS}
        ground="panel"
        bordered
      />
    </>
  )
}
