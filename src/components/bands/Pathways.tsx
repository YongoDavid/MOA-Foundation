import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { FLAGS } from "@/lib/content"

// Spec §4 band 06 — three cards: mentee, mentor, donate. The donate card sits
// on umber-800 with a gold action rather than borrowing the other two's
// treatment, so giving reads as a different kind of act from applying.
export default function Pathways({
  menteeImage,
  menteeAlt,
  mentorImage,
  mentorAlt,
}: {
  menteeImage: StaticImageData
  menteeAlt: string
  mentorImage: StaticImageData
  mentorAlt: string
}) {
  return (
    <section className="bg-paper px-5 py-12 lg:px-14 lg:pb-[76px] lg:pt-16">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-5 lg:grid-cols-3">
          <PathwayCard
            image={menteeImage}
            alt={menteeAlt}
            title="Apply as a mentee"
            body="Open to Africans aged 16 to 30. Applications for cohort five close 30 November."
            action={{ label: "Start an application", href: "/programs/apply" }}
          />
          <PathwayCard
            image={mentorImage}
            alt={mentorAlt}
            title="Mentor a cohort"
            body="Share your experience with a small group of mentees. Get in touch and we will send you everything you need to know."
            action={{ label: "Volunteer as a mentor", href: "/programs/mentor" }}
          />

          <article className="flex flex-col bg-umber-800">
            <div className="flex flex-1 flex-col p-6 lg:p-[26px]">
              <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.18em] text-gold-200">
                Support the work
              </p>
              <h3 className="m-0 mt-4 font-display text-[26px] font-extrabold uppercase leading-[1.02] text-white lg:text-[30px]">
                Fund a place in the next cohort
              </h3>
              <p className="m-0 mt-3.5 font-body text-[13.5px] font-medium leading-[1.6] text-white/[.78]">
                Gifts of any size go directly to mentoring young Africans in
                leadership, education and peace advocacy.
              </p>
              <div className="mt-auto pt-[26px]">
                <Link
                  href="/donate"
                  className="inline-block bg-gold-500 px-[22px] py-3.5 font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200"
                >
                  Donate
                </Link>
              </div>
            </div>
          </article>
        </div>

        {FLAGS.showQuotes ? (
          <figure className="mt-9 grid items-center gap-6 border-l-[3px] border-umber-600 bg-panel px-6 py-[26px] lg:grid-cols-[1fr_auto] lg:gap-10 lg:px-[30px]">
            <blockquote className="m-0 max-w-[820px] font-body text-[17px] font-medium leading-[1.55] text-green-quote [text-wrap:pretty] lg:text-[20px]">
              &ldquo;I give a small part of my month to this. What comes back is
              a young person who knows how to decide.&rdquo;
            </blockquote>
            <figcaption className="font-body text-[10.5px] font-bold uppercase leading-[1.5] tracking-[.14em] text-umber-800 lg:text-right">
              Programme mentor
              <br />
              Cohorts 2–4
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  )
}

function PathwayCard({
  image,
  alt,
  title,
  body,
  action,
}: {
  image: StaticImageData
  alt: string
  title: string
  body: string
  action: { label: string; href: string }
}) {
  return (
    <article className="flex flex-col border border-ink-900/[.16]">
      <div className="relative h-[190px]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 lg:p-[26px]">
        <h3 className="m-0 font-display text-[24px] font-extrabold uppercase leading-[1.05] text-ink-900 lg:text-[26px]">
          {title}
        </h3>
        <p className="m-0 mt-3 font-body text-[13.5px] font-medium leading-[1.6] text-ink-500">
          {body}
        </p>
        <div className="mt-auto pt-6">
          <Link
            href={action.href}
            className="inline-block bg-ink-900 px-[22px] py-3.5 font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-white transition-colors duration-150 hover:bg-green-900"
          >
            {action.label}
          </Link>
        </div>
      </div>
    </article>
  )
}
