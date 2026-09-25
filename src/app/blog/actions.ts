"use server"

import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { insertComment } from "@/lib/comments"

export type CommentState = { error?: string; ok?: boolean }

/**
 * Post a comment. Published immediately — the client's decision, 24 Sep 2026.
 *
 * A thin wrapper. Everything that decides whether a comment is accepted lives
 * in src/lib/comments.ts, which has no Next dependency and can therefore be
 * exercised from a script — see scripts/check-comments.mjs. This file only
 * unpacks the FormData, supplies a client, and revalidates.
 */
export async function postComment(
  _prev: CommentState,
  form: FormData,
): Promise<CommentState> {
  const str = (k: string) => String(form.get(k) ?? "")
  const slug = str("postSlug").trim()

  const supabase = await createSupabaseServerClient()
  const res = await insertComment(supabase, {
    postSlug: slug,
    name: str("name"),
    body: str("body"),
    email: str("email"),
    parentId: str("parentId"),
    trap: str("website"),
  })

  if (!res.ok) return { error: res.error }
  if (slug) revalidatePath(`/blog/${slug}`)
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
