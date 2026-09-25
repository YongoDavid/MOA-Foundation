"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type CommentState = { error?: string; ok?: boolean }

const MAX_BODY = 2000

/**
 * Post a comment. Published immediately — the client's decision, 24 Sep 2026.
 *
 * Immediate publication means the guard rails are constraints and checks, not
 * a review queue:
 *
 *   * `is_staff` is never set here. Only a signed-in admin can wear the
 *     FOUNDATION badge, and the insert policy rejects it from an anonymous
 *     client anyway — this is the second lock on the same door.
 *   * The honeypot field must stay empty. A human never sees it; a bot fills
 *     every input it finds. Silently reports success so the bot does not learn
 *     to skip it.
 *   * The database enforces the same length bounds, so a client bypassing this
 *     action gains nothing.
 */
export async function postComment(
  _prev: CommentState,
  form: FormData,
): Promise<CommentState> {
  const name = String(form.get("name") ?? "").trim()
  const body = String(form.get("body") ?? "").trim()
  const email = String(form.get("email") ?? "").trim()
  const slug = String(form.get("postSlug") ?? "").trim()
  const parentRaw = String(form.get("parentId") ?? "").trim()
  const trap = String(form.get("website") ?? "").trim()

  // Bot. Report success and write nothing.
  if (trap) return { ok: true }

  if (!slug) return { error: "Something went wrong — reload the page." }
  if (!name) return { error: "Please add your name." }
  if (name.length > 80) return { error: "That name is too long." }
  if (!body) return { error: "Write a comment first." }
  if (body.length > MAX_BODY) {
    return { error: `That is longer than ${MAX_BODY} characters.` }
  }
  if (email && !email.includes("@")) {
    return { error: "That email address does not look right." }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.from("comments").insert({
    post_slug: slug,
    parent_id: parentRaw || null,
    name,
    email: email || null,
    body,
    is_staff: false,
    like_count: 0,
  })

  if (error) {
    console.error("[postComment]", error.code, error.message)
    return { error: "Your comment could not be saved. Please try again." }
  }

  revalidatePath(`/blog/${slug}`)
  return { ok: true }
}

/**
 * Like a comment.
 *
 * Calls a SECURITY DEFINER function rather than updating the row: the
 * increment happens inside the database so simultaneous clicks cannot
 * overwrite each other, and no anonymous UPDATE policy on comments is needed —
 * one would also permit rewriting the body of any comment.
 *
 * Unlimited, per the client. The same person may like repeatedly, so this
 * counts enthusiasm rather than people.
 */
export async function likeComment(id: string): Promise<number | null> {
  if (!id) return null
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.rpc("increment_comment_like", {
    comment_id: id,
  })
  if (error) {
    console.error("[likeComment]", error.message)
    return null
  }
  return typeof data === "number" ? data : null
}
