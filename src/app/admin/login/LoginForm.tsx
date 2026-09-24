"use client"

import { useActionState } from "react"
import { Field, SubmitRow } from "@/components/forms/fields"
import { signIn, type AuthState } from "../actions"

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    {},
  )

  return (
    <form action={action} noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="grid gap-3.5">
        <Field
          name="email"
          label="Email"
          type="email"
          placeholder="you@email.org"
          required
        />
        <Field name="password" label="Password" type="password" required />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="m-0 mt-4 border-l-2 border-danger bg-white/[.04] px-4 py-3 font-body text-[13px] font-medium text-white"
        >
          {state.error}
        </p>
      ) : null}

      <SubmitRow label="Sign in" pending={pending} />
    </form>
  )
}
