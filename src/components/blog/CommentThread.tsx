"use client"

import { useActionState, useOptimistic, useRef, useState } from "react"
import { postComment, likeComment } from "@/app/blog/actions"
import type { Comment } from "@/lib/blog-types"
import { formatDate, initials } from "@/lib/blog-format"

// Comments, mockup 1b and spec §8.
//
// Comments are PERSISTED (Supabase, 25 Sep 2026). The optimistic row makes a
// comment appear instantly; postComment writes it. Both halves are needed —
// an earlier revision had only the optimistic half, so a comment appeared and
// then vanished on refresh, and this comment block still claimed that was by
// design. See scripts/check-comments.mjs.
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
  const [replyTo, setReplyTo] = useState<string | null>(null)

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

        // Persist it. The optimistic row above is what makes it appear
        // instantly; this is what makes it still be there after a refresh.
        // An earlier revision had only the optimistic half — the comment
        // showed, then vanished, which is exactly what the prototype
        // notice underneath used to warn about.
        const res = await postComment({}, formData)
        if (res.error) return res.error

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
      style={{ borderTop: "1px solid rgba(20,16,24,.14)" }}
      aria-label="Comments"
    >
      <div className="mb-[22px] flex items-baseline gap-3">
        <h2 className="font-display uppercase m-0 text-[32px] font-extrabold leading-none">
          {optimistic.length} {optimistic.length === 1 ? "comment" : "comments"}
        </h2>
        <span
          className="text-[12px] font-semibold leading-none"
          style={{ color: "#857C86" }}
        >
          Newest first
        </span>
      </div>

      <form
        ref={formRef}
        action={submit}
        className="mb-7 p-[18px]"
        style={{ border: "1px solid rgba(20,16,24,.18)" }}
      >
        {/* The action reads the slug from FormData rather than a closure, so
            the same handler works for a reply form later. */}
        <input type="hidden" name="postSlug" value={postSlug} />
        <div className="mb-[10px] grid gap-[10px] sm:grid-cols-2">
          <input
            name="name"
            required
            maxLength={80}
            placeholder="Your name"
            aria-label="Your name"
            className="px-[14px] py-3 text-[13px] font-medium outline-none"
            style={{ background: "#F3EEE4" }}
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional, not published)"
            aria-label="Email, optional and never published"
            className="px-[14px] py-3 text-[13px] font-medium outline-none"
            style={{ background: "#F3EEE4" }}
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
          className="min-h-[62px] w-full resize-y p-[14px] text-[13.5px] font-medium leading-[1.5] outline-none"
          style={{ background: "#F3EEE4" }}
        />

        {error ? (
          <p
            className="mt-2 font-body text-[12px] font-semibold text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span
            className="text-[11.5px] font-medium leading-[1.4]"
            style={{ color: "#857C86" }}
          >
            Comments appear immediately. Be kind — our team removes abuse.
          </span>
          <button
            type="submit"
            disabled={pending}
            className="min-h-[44px] bg-ink-900 px-6 py-[13px] font-body text-[11.5px] font-bold uppercase leading-none tracking-[.09em] text-white transition-colors duration-150 hover:bg-green-900 disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-[22px]">
        {visible.map((c) => (
          <div key={c.id}>
            <CommentRow comment={c} onReply={setReplyTo} />
            {repliesFor(c.id).map((r) => (
              <div
                key={r.id}
                className="ml-[54px] mt-[22px] pl-[18px]"
                style={{ borderLeft: "2px solid #E2DBCC" }}
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
          borderTop: "1px solid rgba(20,16,24,.16)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={() => {
            bodyRef.current?.scrollIntoView({ block: "center" })
            bodyRef.current?.focus()
          }}
          className="min-h-[48px] flex-1 px-[14px] py-3 text-left text-[12.5px] font-medium"
          style={{
            background: "#F3EEE4",
            color: "#857C86",
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
          className="flex h-12 w-12 flex-none items-center justify-center bg-ink-900 font-body text-[14px] font-bold text-white"
        >
          ↑
        </button>
      </div>

      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-[26px] min-h-[48px] w-full p-[13px] text-center text-[12.5px] font-bold leading-none"
          style={{
            border: "1px solid rgba(20,16,24,.18)",
            color: "#B4762A",
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
  onReply,
}: {
  comment: Draft
  compact?: boolean
  /** Absent on a reply: the thread nests one level only, enforced by a
      database trigger, so a reply cannot itself be replied to. */
  onReply?: (id: string) => void
}) {
  const size = compact ? "h-9 w-9 text-[12px]" : "h-10 w-10 text-[13px]"
  return (
    <div
      className="flex gap-[14px]"
      style={comment.pending ? { opacity: 0.6 } : undefined}
    >
      <span
        className={`flex flex-none items-center justify-center font-bold leading-none ${size}`}
        style={{ background: "#E2DBCC", color: "#7A6F5E" }}
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
              className="bg-green-900 px-2 py-1 font-body text-[9px] font-bold uppercase leading-none tracking-[.1em] text-white"
            >
              Foundation
            </span>
          ) : null}
          <span
            className="text-[11.5px] font-semibold leading-none"
            style={{ color: "#857C86" }}
          >
            {comment.createdAt ? formatDate(comment.createdAt, "long") : "Just now"}
          </span>
        </div>
        {/* Comment bodies are the only visitor-authored text on the site.
            break-words so a single pasted URL cannot push the page sideways
            on a phone. */}
        <p className="m-0 break-words font-body text-[14.5px] font-medium leading-[1.65] text-ink-700">
          {comment.body}
        </p>
        <div
          className="mt-[9px] flex gap-4 text-[11.5px] font-bold leading-none"
          style={{ color: "#857C86" }}
        >
          {onReply && !comment.pending ? (
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="min-h-[44px] font-body text-[11.5px] font-bold uppercase tracking-[.06em] transition-colors duration-150 hover:text-umber-600"
            >
              Reply
            </button>
          ) : null}
          <LikeButton id={comment.id} initial={comment.likeCount} pending={Boolean(comment.pending)} />
        </div>
      </div>
    </div>
  )
}


/**
 * Like a comment.
 *
 * Unlimited by the client's decision (25 Sep 2026) — the same visitor may
 * click as often as they like — so there is no per-person guard and the number
 * measures enthusiasm rather than people.
 *
 * The count moves immediately and is reconciled with whatever the database
 * returns, so two people liking at the same moment both land: the increment
 * happens inside Postgres, not as a read-then-write from here.
 *
 * An optimistic comment has no database row yet, so its button is inert until
 * the page refreshes and it acquires a real id.
 */
function LikeButton({
  id,
  initial,
  pending,
}: {
  id: string
  initial: number
  pending: boolean
}) {
  const [count, setCount] = useState(initial)
  const [busy, setBusy] = useState(false)

  if (pending) {
    return <span aria-hidden="true">♡ {count}</span>
  }

  return (
    <button
      type="button"
      disabled={busy}
      aria-label={`Like this comment. ${count} ${count === 1 ? "like" : "likes"} so far.`}
      onClick={async () => {
        setBusy(true)
        setCount((n) => n + 1)
        const next = await likeComment(id)
        if (typeof next === "number") setCount(next)
        setBusy(false)
      }}
      className="min-h-[44px] font-body text-[11.5px] font-bold uppercase tracking-[.06em] transition-colors duration-150 hover:text-umber-600 disabled:opacity-60"
    >
      ♡ {count}
    </button>
  )
}


/**
 * Reply to one comment.
 *
 * Its own form and its own action state rather than a branch of the main one:
 * two forms sharing a single useActionState would show the same pending
 * indicator and the same error, so submitting a reply would light up the
 * composer at the top of the page.
 *
 * No optimistic row here. A reply belongs under a specific parent, and the
 * parent's optimistic list lives in the thread above — the server action
 * revalidates the path, so the reply arrives with the refreshed tree a moment
 * later. Getting that wrong would show the reply in the wrong place.
 */
function ReplyForm({
  postSlug,
  parentId,
  replyingTo,
  onDone,
}: {
  postSlug: string
  parentId: string
  replyingTo: string
  onDone: () => void
}) {
  const [error, submit, pending] = useActionState<string | null, FormData>(
    async (_prev, formData) => {
      const res = await postComment({}, formData)
      if (res.error) return res.error
      onDone()
      return null
    },
    null,
  )

  return (
    <form action={submit} className="border border-ink-900/[.18] p-4">
      <input type="hidden" name="postSlug" value={postSlug} />
      <input type="hidden" name="parentId" value={parentId} />
      {/* Same honeypot as the main composer. A bot that finds this form finds
          this field too. */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />

      <p className="m-0 mb-3 font-body text-[11px] font-bold uppercase tracking-[.1em] text-ink-400">
        Replying to {replyingTo}
      </p>

      <div className="mb-2.5 grid gap-2.5 sm:grid-cols-2">
        <input
          name="name"
          required
          maxLength={80}
          placeholder="Your name"
          aria-label="Your name"
          className="min-h-[44px] bg-panel px-3.5 font-body text-[13px] font-medium text-ink-900 outline-none"
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optional, not published)"
          aria-label="Email, optional and never published"
          className="min-h-[44px] bg-panel px-3.5 font-body text-[13px] font-medium text-ink-900 outline-none"
        />
      </div>

      <textarea
        name="body"
        required
        rows={3}
        maxLength={MAX_LENGTH}
        placeholder="Write your reply…"
        aria-label="Your reply"
        className="w-full resize-y bg-panel p-3.5 font-body text-[13.5px] leading-[1.55] text-ink-900 outline-none"
      />

      {error ? (
        <p role="alert" className="m-0 mt-2 font-body text-[12px] font-semibold text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] bg-ink-900 px-5 font-body text-[11px] font-bold uppercase tracking-[.09em] text-white disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post reply"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-[44px] font-body text-[11px] font-bold uppercase tracking-[.09em] text-ink-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
