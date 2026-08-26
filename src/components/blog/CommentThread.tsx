"use client"

import { useActionState, useOptimistic, useRef, useState } from "react"
import type { Comment } from "@/lib/blog-types"
import { formatDate, initials } from "@/lib/blog-format"

// Comments, mockup 1b and spec §8.
//
// PROTOTYPE: presentation and optimistic behaviour only. A submitted comment
// appears instantly and is NOT persisted — a refresh clears it. That is stated
// in the UI rather than left for a client to discover mid-demo.
//
// Deliberately absent: the staff Delete control. Spec §8 requires it be absent
// from the public DOM rather than hidden, and there is no auth here — so
// rendering a disabled or hidden Delete would misrepresent the security model.
// Likes, rate limiting, link stripping and the honeypot's server half are
// Plan 3.
//
// Timestamps are ABSOLUTE, not "2 hours ago". Relative time needs Date.now(),
// which differs between the server render and the client and causes a
// hydration mismatch — the bug class already fixed twice in this codebase.
// Only optimistic comments, which exist solely on the client, say "Just now".

const SHOW_INITIALLY = 3
const MAX_LENGTH = 2000

type Draft = Comment & { pending?: boolean }

export default function CommentThread({
  postSlug,
  comments,
}: {
  postSlug: string
  comments: Comment[]
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const [expanded, setExpanded] = useState(false)

  const [optimistic, addOptimistic] = useOptimistic<Draft[], Draft>(
    comments as Draft[],
    (state, next) => [next, ...state],
  )

  const [error, submit, pending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const name = String(formData.get("name") ?? "").trim()
      const body = String(formData.get("body") ?? "").trim()
      // Honeypot: a real person leaves this empty. Bots fill every field.
      const trap = String(formData.get("website") ?? "")

      if (trap) return null // silently drop, as a real endpoint would
      if (!name) return "Please add your name."
      if (!body) return "Please write a comment."
      if (body.length > MAX_LENGTH) {
        return `Comments are limited to ${MAX_LENGTH} characters.`
      }

      addOptimistic({
        id: `optimistic-${name}-${body.length}`,
        postSlug,
        parentId: null,
        name,
        isStaff: false,
        body,
        createdAt: "",
        likeCount: 0,
        pending: true,
      })
      formRef.current?.reset()
      return null
    },
    null,
  )

  const topLevel = optimistic.filter((c) => c.parentId === null)
  const repliesFor = (id: string) => optimistic.filter((c) => c.parentId === id)
  const visible = expanded ? topLevel : topLevel.slice(0, SHOW_INITIALLY)
  const hidden = topLevel.length - visible.length

  return (
    <section
      className="mt-10 max-w-[760px] pt-8"
      style={{ borderTop: "1px solid var(--blog-hairline)" }}
      aria-label="Comments"
    >
      <div className="mb-[22px] flex items-baseline gap-3">
        <h2 className="m-0 text-[22px] font-extrabold leading-[1.2] tracking-[-.015em]">
          {optimistic.length} {optimistic.length === 1 ? "comment" : "comments"}
        </h2>
        <span
          className="text-[12px] font-semibold leading-none"
          style={{ color: "var(--blog-ink-400)" }}
        >
          Newest first
        </span>
      </div>

      <form
        ref={formRef}
        action={submit}
        className="mb-7 rounded-2xl p-[18px]"
        style={{ border: "1px solid var(--blog-input)" }}
      >
        <div className="mb-[10px] grid gap-[10px] sm:grid-cols-2">
          <input
            name="name"
            required
            maxLength={80}
            placeholder="Your name"
            aria-label="Your name"
            className="rounded-[10px] px-[14px] py-3 text-[13px] font-medium outline-none"
            style={{ background: "var(--blog-canvas)" }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional, not published)"
            aria-label="Email, optional and never published"
            className="rounded-[10px] px-[14px] py-3 text-[13px] font-medium outline-none"
            style={{ background: "var(--blog-canvas)" }}
          />
        </div>

        {/* Honeypot — hidden from people, irresistible to bots. */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 opacity-0"
          style={{ position: "absolute", left: "-9999px" }}
        />

        <textarea
          ref={bodyRef}
          name="body"
          required
          maxLength={MAX_LENGTH}
          placeholder="Share a thought about this post…"
          aria-label="Your comment"
          className="min-h-[62px] w-full resize-y rounded-[10px] p-[14px] text-[13.5px] font-medium leading-[1.5] outline-none"
          style={{ background: "var(--blog-canvas)" }}
        />

        {error ? (
          <p
            className="mt-2 text-[12px] font-semibold"
            style={{ color: "var(--blog-danger)" }}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span
            className="text-[11.5px] font-medium leading-[1.4]"
            style={{ color: "var(--blog-ink-400)" }}
          >
            Comments appear immediately. Be kind — our team removes abuse.
          </span>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[9px] px-[22px] py-[11px] text-[12.5px] font-bold leading-none text-white disabled:opacity-60"
            style={{ background: "var(--blog-violet-600)" }}
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {/* Prototype honesty: say it here rather than let a client find out. */}
      <p
        className="mb-6 rounded-[10px] px-3 py-2 text-[11.5px] font-semibold"
        style={{
          background: "var(--blog-violet-050)",
          color: "var(--blog-violet-900)",
        }}
      >
        Prototype — comments post instantly but are not saved. Refreshing clears
        them.
      </p>

      <div className="flex flex-col gap-[22px]">
        {visible.map((c) => (
          <div key={c.id}>
            <CommentRow comment={c} />
            {repliesFor(c.id).map((r) => (
              <div
                key={r.id}
                className="ml-[54px] mt-[22px] pl-[18px]"
                style={{ borderLeft: "2px solid var(--blog-violet-050)" }}
              >
                <CommentRow comment={r} compact />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/*
        Mockup 1e: on mobile the composer collapses to a sticky bottom bar.
        It focuses the real form rather than duplicating it — two forms would
        mean two sets of fields with the same names, and a screen reader
        announcing the composer twice.

        `print:hidden` keeps it out of printed output, and the padding honours
        env(safe-area-inset-bottom) so it clears the iOS home indicator.
      */}
      <div
        className="sticky bottom-0 z-20 -mx-[18px] mt-8 flex items-center gap-[10px] bg-white px-[18px] pt-3 md:hidden print:hidden"
        style={{
          borderTop: "1px solid var(--blog-border)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={() => {
            bodyRef.current?.scrollIntoView({ block: "center" })
            bodyRef.current?.focus()
          }}
          className="flex-1 rounded-full px-[14px] py-3 text-left text-[12.5px] font-medium"
          style={{
            background: "var(--blog-canvas)",
            color: "var(--blog-ink-400)",
          }}
        >
          Add a comment…
        </button>
        <button
          type="button"
          aria-label="Go to the comment form"
          onClick={() => {
            bodyRef.current?.scrollIntoView({ block: "center" })
            bodyRef.current?.focus()
          }}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-[14px] font-bold text-white"
          style={{ background: "var(--blog-violet-600)" }}
        >
          ↑
        </button>
      </div>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-[26px] w-full rounded-[10px] p-[13px] text-center text-[12.5px] font-bold leading-none"
          style={{
            border: "1px solid var(--blog-input)",
            color: "var(--blog-violet-600)",
          }}
        >
          Load {hidden} more {hidden === 1 ? "comment" : "comments"}
        </button>
      ) : null}
    </section>
  )
}

function CommentRow({
  comment,
  compact = false,
}: {
  comment: Draft
  compact?: boolean
}) {
  const size = compact ? "h-9 w-9 text-[12px]" : "h-10 w-10 text-[13px]"
  return (
    <div
      className="flex gap-[14px]"
      style={comment.pending ? { opacity: 0.6 } : undefined}
    >
      <span
        className={`flex flex-none items-center justify-center rounded-full font-bold leading-none ${size}`}
        style={{ background: "var(--blog-media-empty)", color: "#7A6E96" }}
      >
        {initials(comment.name)}
      </span>
      <div className="flex-1">
        <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
          <span className="text-[13.5px] font-bold leading-none">
            {comment.name}
          </span>
          {comment.isStaff ? (
            <span
              className="rounded-[5px] px-2 py-1 text-[9.5px] font-bold uppercase leading-none tracking-[.08em] text-white"
              style={{ background: "var(--blog-violet-600)" }}
            >
              Foundation
            </span>
          ) : null}
          <span
            className="text-[11.5px] font-semibold leading-none"
            style={{ color: "var(--blog-ink-400)" }}
          >
            {comment.createdAt ? formatDate(comment.createdAt, "long") : "Just now"}
          </span>
        </div>
        <p
          className="m-0 text-[14.5px] font-medium leading-[1.65]"
          style={{ color: "var(--blog-ink-700)" }}
        >
          {comment.body}
        </p>
        <div
          className="mt-[9px] flex gap-4 text-[11.5px] font-bold leading-none"
          style={{ color: "var(--blog-ink-400)" }}
        >
          <span>Reply</span>
          <span>♡ {comment.likeCount}</span>
        </div>
      </div>
    </div>
  )
}
