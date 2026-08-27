"use client"

import { useActionState } from "react"
import { SITE } from "@/lib/site"
import { Field, Segmented, Select, SubmitRow, SubmittedPanel, TextArea } from "./fields"

// General contact (spec §7, contact mockup). The subject segmented control
// comes first: it is what routes the message internally, and asking for it
// after the message body means people describe the category in prose instead.

const SUBJECTS = ["Mentoring", "Volunteering", "Partnership", "Something else"]

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Cameroon", "Uganda",
  "United Kingdom", "United States", "Canada", "Other",
]

type State = { errors: Record<string, string>; done: boolean }

export default function ContactForm() {
  const [state, submit, pending] = useActionState<State, FormData>(
    async (_prev, form) => {
      const errors: Record<string, string> = {}
      const get = (k: string) => String(form.get(k) ?? "").trim()

      if (!get("subject")) errors.subject = "Please choose what this is about."
      if (!get("name")) errors.name = "Please add your name."
      if (!get("email").includes("@")) errors.email = "Enter a valid email address."
      if (!get("country")) errors.country = "Please choose a country."
      if (get("message").length < 10)
        errors.message = "Please tell us a little more — at least 10 characters."

      if (Object.keys(errors).length > 0) return { errors, done: false }
      return { errors: {}, done: true }
    },
    { errors: {}, done: false },
  )

  if (state.done) return <SubmittedPanel heading="Message received" />

  return (
    <form action={submit} noValidate>
      <Segmented
        name="subject"
        legend="I am writing about"
        options={SUBJECTS}
        columns={2}
        error={state.errors.subject}
      />

      <div className="mt-[22px] grid gap-3 sm:grid-cols-2">
        <Field name="name" label="Name" placeholder="Your name" required error={state.errors.name} />
        <Field name="email" label="Email" placeholder="you@email.com" type="email" required error={state.errors.email} />
        <Field name="phone" label="Phone" placeholder="+234" type="tel" optional />
        <Select name="country" label="Country" options={COUNTRIES} required error={state.errors.country} />
      </div>

      <div className="mt-4">
        <TextArea
          name="message"
          label="Message"
          placeholder="Tell us what you need."
          required
          error={state.errors.message}
        />
      </div>

      <SubmitRow label="Send message" pending={pending} note={SITE.replyPromise} />
    </form>
  )
}
