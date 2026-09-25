"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Field, Label, SubmitRow } from "@/components/forms/fields"
import { signIn, type AuthState } from "../actions"

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    {},
  )
  const [visible, setVisible] = useState(false)

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

        {/* Password, with a reveal.
            The toggle is a real button, not an icon with a click handler, so
            it is reachable by keyboard and announced. aria-pressed carries the
            state; the label changes with it so a screen reader is told what
            the next press will do rather than what the icon looks like.
            type="button" matters — inside a form a bare <button> submits, so
            revealing the password would try to sign in. */}
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              required
              autoComplete="current-password"
              className="min-h-[48px] w-full border border-white/[.16] bg-white/[.08] py-3.5 pl-4 pr-12 font-body text-[13.5px] font-medium leading-none text-white outline-none placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 lg:min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              aria-label={visible ? "Hide password" : "Show password"}
              title={visible ? "Hide password" : "Show password"}
              className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/60 transition-colors duration-150 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              {visible ? (
                <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
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
