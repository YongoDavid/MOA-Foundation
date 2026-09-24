"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AuthState = { error?: string }

/**
 * Sign in the shared admin account.
 *
 * Errors are deliberately vague — "those details were not accepted" rather
 * than "no such user" or "wrong password". Distinguishing the two tells an
 * attacker which half they got right, and with a single known account that is
 * the whole of the guesswork.
 */
export async function signIn(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim()
  const password = String(form.get("password") ?? "")
  const next = String(form.get("next") ?? "/admin")

  if (!email || !password) return { error: "Enter your email and password." }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: "Those details were not accepted." }

  revalidatePath("/admin", "layout")
  // Only ever redirect within this site. `next` arrives from the query string,
  // and an open redirect is what turns a login page into a phishing tool.
  redirect(next.startsWith("/admin") ? next : "/admin")
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/admin", "layout")
  redirect("/admin/login")
}
