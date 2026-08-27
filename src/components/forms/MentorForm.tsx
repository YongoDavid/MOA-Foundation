"use client"

import { useActionState } from "react"
import {
  Consent,
  Field,
  Segmented,
  Select,
  SubmitRow,
  SubmittedPanel,
  TextArea,
} from "./fields"

// Mentor enquiry (spec §7).
//
// Deliberately SHORT — an enquiry, not an assessment. The spec is explicit
// that the mentor and apply pages stay brief by design, and that programme
// logistics were removed from the public site at the client's request.

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Cameroon", "Uganda",
  "United Kingdom", "United States", "Canada", "Other",
]

const AVAILABILITY = ["Weekday evenings", "Weekends", "Either"]

type State = { errors: Record<string, string>; done: boolean }

export default function MentorForm() {
  const [state, submit, pending] = useActionState<State, FormData>(
    async (_prev, form) => {
      const errors: Record<string, string> = {}
      const get = (k: string) => String(form.get(k) ?? "").trim()

      if (!get("name")) errors.name = "Please add your name."
      if (!get("email").includes("@")) errors.email = "Enter a valid email address."
      if (!get("country")) errors.country = "Please choose a country."
      if (!get("field")) errors.field = "Please add your field of work."
      if (!get("availability")) errors.availability = "Please choose your availability."
      if (get("motivation").length < 20)
        errors.motivation = "A few sentences, please — at least 20 characters."
      if (!form.get("consent")) errors.consent = "Please confirm to continue."

      if (Object.keys(errors).length > 0) return { errors, done: false }
      return { errors: {}, done: true }
    },
    { errors: {}, done: false },
  )

  if (state.done) return <SubmittedPanel heading="Enquiry received" />

  return (
    <form action={submit} noValidate>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field name="name" label="Full name" placeholder="Your name" required error={state.errors.name} />
        <Field name="email" label="Email" placeholder="you@email.org" type="email" required error={state.errors.email} />
        <Select name="country" label="Country of residence" options={COUNTRIES} required error={state.errors.country} />
        <Field name="field" label="Field of work" placeholder="e.g. law, engineering, trade" required error={state.errors.field} />
      </div>

      <div className="mt-5">
        <Segmented
          name="availability"
          legend="Availability"
          options={AVAILABILITY}
          columns={3}
          error={state.errors.availability}
        />
      </div>

      <div className="mt-5">
        <TextArea
          name="motivation"
          label="Why do you want to mentor?"
          placeholder="A few sentences is enough. We read every one."
          required
          error={state.errors.motivation}
        />
      </div>

      <div className="mt-5">
        <Consent name="consent" error={state.errors.consent}>
          I consent to being contacted about mentoring and to child protection
          screening.
        </Consent>
      </div>

      <SubmitRow
        label="Submit application"
        pending={pending}
        note={
          <>
            Preview only — enquiries
            <br />
            are not yet being received.
          </>
        }
      />
    </form>
  )
}
