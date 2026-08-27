"use client"

import { useActionState } from "react"

// Spec §4 — green-900, `1fr 1fr`. The field and button are FLUSH: no gap, no
// radius. That adjacency is the design.
//
// PROTOTYPE: the submit is stubbed. Backend is deferred until the client has
// seen this version, so the form validates and reports honestly rather than
// pretending to subscribe anyone. The old site showed "✓ Subscribed!" for
// three seconds while sending nothing; this does not repeat that.
export default function NewsletterBand() {
  const [state, submit, pending] = useActionState<
    { ok: boolean; message: string } | null,
    FormData
  >(async (_prev, formData) => {
    const email = String(formData.get("email") ?? "").trim()
    if (!email || !email.includes("@")) {
      return { ok: false, message: "Enter a valid email address." }
    }
    return {
      ok: true,
      message: "Not yet connected — sign-ups are not being received.",
    }
  }, null)

  return (
    <section className="bg-green-900 px-5 py-12 lg:px-14 lg:py-[66px]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="m-0 font-display text-[30px] font-extrabold uppercase leading-[1.02] text-white lg:text-[40px]">
            Our quarterly report,
            <br />
            in your inbox
          </h2>
          <p className="m-0 mt-3.5 max-w-[420px] font-body text-[14px] font-medium leading-[1.6] text-white/[.72]">
            Cohort outcomes, partnership news and open calls. Four emails a
            year, nothing else.
          </p>
        </div>

        <div>
          <form action={submit} className="flex">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="your@email.org"
              className="min-w-0 flex-1 bg-white/10 px-5 py-[18px] font-body text-[14px] font-medium leading-none text-white outline-none placeholder:text-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 bg-gold-500 px-7 py-[18px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200 disabled:opacity-60"
            >
              {pending ? "…" : "Subscribe"}
            </button>
          </form>
          {state ? (
            <p
              role="status"
              className={`m-0 mt-3 font-body text-[12px] font-semibold ${
                state.ok ? "text-gold-200" : "text-white"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
