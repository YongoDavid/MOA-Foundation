"use client"

import { useActionState } from "react"
import { submitForm } from "@/app/actions/forms"
import {
  Consent,
  Field,
  Honeypot,
  Segmented,
  Select,
  SendError,
  SubmitRow,
  SubmittedPanel,
  TextArea,
} from "./fields"

// Mentee application (spec §7).
//
// PROTOTYPE: validation is real and runs on submit; the network call is not
// wired. Backend deferred until the client has seen this version.
//
// Deliberately absent: cycle length, session frequency, group size, ratios and
// per-place cost. The client asked for all programme logistics off the public
// site — interested people contact the Foundation and receive the detail
// directly. Do not reintroduce any of it from an older mockup.

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Cameroon", "Uganda",
  "Tanzania", "Rwanda", "Ethiopia", "Egypt", "Other",
]

const PROGRAMMES = ["Leadership", "Education", "Entrepreneurship", "Peace advocacy"]

type State = { errors: Record<string, string>; done: boolean; sendError?: string }

export default function MenteeForm() {
  const [state, submit, pending] = useActionState<State, FormData>(
    async (_prev, form) => {
      const errors: Record<string, string> = {}
      const get = (k: string) => String(form.get(k) ?? "").trim()

      if (!get("name")) errors.name = "Please add your name."
      const age = Number(get("age"))
      if (!get("age")) errors.age = "Please add your age."
      else if (!Number.isFinite(age) || age < 10 || age > 99)
        errors.age = "Enter an age between 10 and 99."
      if (!get("email").includes("@")) errors.email = "Enter a valid email address."
      if (!get("phone")) errors.phone = "Please add a phone or WhatsApp number."
      if (!get("country")) errors.country = "Please choose a country."
      if (!get("city")) errors.city = "Please add your city or state."
      if (!get("programme")) errors.programme = "Please choose a programme."
      if (get("motivation").length < 20)
        errors.motivation = "A few sentences, please — at least 20 characters."
      if (!form.get("consent")) errors.consent = "Please confirm to continue."

      if (Object.keys(errors).length > 0) return { errors, done: false }

      // Local checks are for the messages; they run in the browser and a
      // browser can be bypassed, so the action validates again server-side.
      const sent = await submitForm('mentee', {}, form)
      if (sent.error) return { errors: {}, done: false, sendError: sent.error }

      return { errors: {}, done: true }
    },
    { errors: {}, done: false },
  )

  if (state.done) return <SubmittedPanel heading="Application received" />

  return (
    <form action={submit} noValidate>
      <Honeypot />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field name="name" label="Full name" placeholder="Your name" required error={state.errors.name} />
        <Field name="age" label="Age" placeholder="e.g. 19" type="number" required error={state.errors.age} />
        <Field name="email" label="Email" placeholder="you@email.com" type="email" required error={state.errors.email} />
        <Field name="phone" label="Phone or WhatsApp" placeholder="+234" type="tel" required error={state.errors.phone} />
        <Select name="country" label="Country" options={COUNTRIES} required error={state.errors.country} />
        <Field name="city" label="City or state" placeholder="e.g. Abuja" required error={state.errors.city} />
      </div>

      <div className="mt-6">
        <Segmented
          name="programme"
          legend="Which programme interests you?"
          options={PROGRAMMES}
          error={state.errors.programme}
        />
      </div>

      <div className="mt-6">
        <TextArea
          name="motivation"
          label="What do you want mentoring to help you do?"
          placeholder="A few sentences in your own words."
          required
          error={state.errors.motivation}
        />
      </div>

      <div className="mt-5">
        <Field
          name="referral"
          label="How did you hear about us?"
          placeholder="A friend, social media, an event…"
          optional
        />
      </div>

      <div className="mt-6">
        <Consent name="consent" error={state.errors.consent}>
          I confirm the information above is mine and consent to the Foundation
          contacting me about the programme. If I am under 18, a parent or
          guardian has agreed.
        </Consent>
      </div>

      <SendError error={state.sendError} />

      <SubmitRow
        label="Submit application"
        pending={pending}
        note={
          <>
            We reply within two
            <br />
            working days.
          </>
        }
      />
    </form>
  )
}
