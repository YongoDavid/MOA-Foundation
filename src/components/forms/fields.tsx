"use client"

import type { ReactNode } from "react"

// Form primitives (spec §7). All four forms sit on dark grounds and share
// this pattern: white-8% fill, white-16% border, uppercase micro-label above.
//
// Every interactive cell is at least 44px tall, 48px on mobile. Segmented
// choices are where that is easiest to lose — check them after any type change.

const FIELD =
  "w-full min-h-[48px] lg:min-h-[44px] bg-white/[.08] border border-white/[.16] px-4 py-3.5 font-body text-[13.5px] font-medium leading-none text-white outline-none placeholder:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"

export function Label({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string
  children: ReactNode
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-body text-[10px] font-bold uppercase leading-none tracking-[.12em] text-white/50"
    >
      {children}
      {optional ? <span className="ml-1.5 text-white/30">Optional</span> : null}
    </label>
  )
}

export function Field({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  optional = false,
  error,
}: {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  optional?: boolean
  error?: string
}) {
  return (
    <div>
      <Label htmlFor={name} optional={optional}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={FIELD}
      />
      <FieldError id={`${name}-error`} error={error} />
    </div>
  )
}

export function TextArea({
  name,
  label,
  placeholder,
  required = false,
  error,
}: {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${FIELD} min-h-[100px] resize-y leading-[1.6]`}
      />
      <FieldError id={`${name}-error`} error={error} />
    </div>
  )
}

export function Select({
  name,
  label,
  options,
  required = false,
  error,
}: {
  name: string
  label: string
  options: string[]
  required?: boolean
  error?: string
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <select
          id={name}
          name={name}
          required={required}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${FIELD} appearance-none pr-10`}
        >
          <option value="" disabled>
            Select…
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-ink-900 text-white">
              {o}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-body text-[12px] text-white/50"
        >
          ▾
        </span>
      </div>
      <FieldError id={`${name}-error`} error={error} />
    </div>
  )
}

/**
 * Segmented radio group.
 *
 * Two treatments, and they are not interchangeable:
 *
 * - `columns` 2 or 3 — short uppercase choices, centred. Selected fills gold.
 * - `columns` 1 — a stacked list of full sentences (the donate designations).
 *   Selected keeps the field fill and marks itself with a gold check instead
 *   of filling gold, because a full-width gold bar per option reads as four
 *   buttons rather than one choice, and sentence case centred is unreadable.
 */
export function Segmented({
  name,
  legend,
  options,
  columns = 2,
  defaultValue,
  error,
}: {
  name: string
  legend: string
  options: string[]
  columns?: 1 | 2 | 3
  defaultValue?: string
  error?: string
}) {
  const stacked = columns === 1
  const grid = stacked
    ? "grid-cols-1"
    : columns === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2"

  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2.5 font-body text-[10px] font-bold uppercase leading-none tracking-[.12em] text-white/50">
        {legend}
      </legend>
      <div className={`grid gap-2 ${grid}`}>
        {options.map((o) => (
          <label
            key={o}
            className={
              stacked
                ? "relative flex min-h-[48px] cursor-pointer items-center justify-between gap-3 border border-white/[.16] px-4 py-3.5 font-body text-[12.5px] font-semibold leading-snug text-white/[.72] transition-colors duration-150 has-[:checked]:bg-white/[.08] has-[:checked]:text-white lg:min-h-[44px]"
                : "relative flex min-h-[48px] cursor-pointer items-center justify-center border border-white/[.22] px-3 text-center font-body text-[11.5px] font-bold uppercase leading-tight text-white/75 transition-colors duration-150 has-[:checked]:border-gold-500 has-[:checked]:bg-gold-500 has-[:checked]:text-ink-900 lg:min-h-[44px]"
            }
          >
            <input
              type="radio"
              name={name}
              value={o}
              defaultChecked={defaultValue === o}
              className="peer absolute h-px w-px opacity-0 focus-visible:outline-none"
            />
            {o}
            {stacked ? (
              <span
                aria-hidden="true"
                className="hidden flex-none font-body text-[13px] text-gold-500 peer-checked:inline"
              >
                ✓
              </span>
            ) : null}
          </label>
        ))}
      </div>
      <FieldError id={`${name}-error`} error={error} />
    </fieldset>
  )
}

export function Consent({
  name,
  children,
  error,
}: {
  name: string
  children: ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name={name}
          className="mt-0.5 h-[18px] w-[18px] flex-none appearance-none border border-white/35 bg-transparent checked:bg-gold-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        />
        <span className="font-body text-[12.5px] font-medium leading-[1.6] text-white/70">
          {children}
        </span>
      </label>
      <FieldError id={`${name}-error`} error={error} />
    </div>
  )
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} className="m-0 mt-2 font-body text-[12px] font-semibold text-gold-200">
      {error}
    </p>
  )
}

export function SubmitRow({
  label,
  note,
  pending,
}: {
  label: string
  note?: ReactNode
  pending: boolean
}) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-5">
      <button
        type="submit"
        disabled={pending}
        className="min-h-[48px] bg-gold-500 px-[30px] py-[17px] font-body text-[12px] font-bold uppercase leading-none tracking-[.09em] text-ink-900 transition-colors duration-150 hover:bg-gold-200 disabled:opacity-60 lg:min-h-[44px]"
      >
        {pending ? "Sending…" : label}
      </button>
      {note ? (
        <p className="m-0 font-body text-[12px] font-medium leading-[1.5] text-white/50">
          {note}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Success state — REPLACES the form rather than opening a modal (spec §7).
 *
 * PROTOTYPE: no backend is connected, so this says so. Showing a plain
 * "thank you, we'll be in touch" would repeat the old site's newsletter,
 * which displayed "✓ Subscribed!" while sending nothing.
 */
export function SubmittedPanel({ heading }: { heading: string }) {
  return (
    <div
      role="status"
      className="border border-gold-500/40 bg-white/[.04] p-8"
    >
      <h3 className="m-0 font-display text-[28px] font-extrabold uppercase leading-[1.05] text-white">
        {heading}
      </h3>
      <p className="m-0 mt-4 font-body text-[14px] font-medium leading-[1.65] text-white/70">
        Your details passed validation — but this site is a preview and no
        submission endpoint is connected yet, so nothing was sent and no
        confirmation email will arrive.
      </p>
      <p className="m-0 mt-3 font-body text-[14px] font-medium leading-[1.65] text-white/70">
        To reach the Foundation today, write to{" "}
        <a href="mailto:mosesofafrica@gmail.com" className="text-gold-500 underline">
          mosesofafrica@gmail.com
        </a>{" "}
        or call{" "}
        <a href="tel:+2348037315490" className="text-gold-500 underline">
          +234 803 731 5490
        </a>
        .
      </p>
    </div>
  )
}
