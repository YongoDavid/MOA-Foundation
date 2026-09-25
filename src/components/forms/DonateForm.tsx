"use client"

import { useActionState } from "react"
import { submitForm } from "@/app/actions/forms"
import { DESIGNATIONS } from "@/lib/content"
import { SITE } from "@/lib/site"
import {
  Field,
  Honeypot,
  Segmented,
  SendError,
  SubmitRow,
  SubmittedPanel,
  TextArea,
} from "./fields"

/**
 * Donation enquiry (spec §7, donate mockup band 02).
 *
 * This form does NOT take a payment and is not a step toward one. It collects
 * a name and a way to reply so the team can send account details and the
 * current areas of need. That is the client's stated model — no gateway is
 * integrated, no card details are handled anywhere on this site.
 *
 * Every downstream change must keep that honest. If a "card" or "amount" field
 * ever appears here without a real gateway behind it, the page starts lying to
 * people about where their money is going.
 */

type State = { errors: Record<string, string>; done: boolean; sendError?: string }

export default function DonateForm() {
  const [state, submit, pending] = useActionState<State, FormData>(
    async (_prev, form) => {
      const errors: Record<string, string> = {}
      const get = (k: string) => String(form.get(k) ?? "").trim()

      if (!get("name")) errors.name = "Please add your name."
      if (!get("email").includes("@")) errors.email = "Enter a valid email address."
      if (!get("designation")) errors.designation = "Please choose where your gift should go."

      if (Object.keys(errors).length > 0) return { errors, done: false }

      // Local checks are for the messages; they run in the browser and a
      // browser can be bypassed, so the action validates again server-side.
      const sent = await submitForm('donate', {}, form)
      if (sent.error) return { errors: {}, done: false, sendError: sent.error }

      return { errors: {}, done: true }
    },
    { errors: {}, done: false },
  )

  if (state.done) return <SubmittedPanel heading="Details received" />

  return (
    <form action={submit} noValidate>
      <Honeypot />
      <div className="grid gap-3.5">
        <Field name="name" label="Name" placeholder="Your name" required error={state.errors.name} />
        <Field name="email" label="Email" placeholder="you@email.com" type="email" required error={state.errors.email} />
        <Field name="phone" label="Phone or WhatsApp" placeholder="+234" type="tel" optional />
      </div>

      <div className="mt-[22px]">
        <Segmented
          name="designation"
          legend="I would like to support"
          options={DESIGNATIONS}
          columns={1}
          defaultValue={DESIGNATIONS[0]}
          error={state.errors.designation}
        />
      </div>

      <div className="mt-[22px]">
        <TextArea
          name="note"
          label="Anything you want us to know"
          placeholder="Whether you are giving once or regularly, in cash or in kind."
        />
      </div>

      <SendError error={state.sendError} />

      <SubmitRow label="Send my details" pending={pending} />

      {/* Load-bearing, not boilerplate: it is the only thing on the page that
          tells a visitor no payment is being requested here. */}
      <p className="m-0 mt-4 font-body text-[12px] font-medium leading-[1.6] text-white/50">
        {SITE.replyPromise} No payment is taken on this website.
      </p>
    </form>
  )
}
