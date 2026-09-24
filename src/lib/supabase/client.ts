"use client"

import { createBrowserClient } from "@supabase/ssr"
import { requireSupabaseEnv } from "./env"

/**
 * Browser client, for the few places that must talk to Supabase from the
 * client — posting a comment, incrementing a like.
 *
 * Everything the admin does goes through Server Actions instead, so the editor
 * never needs this. Row-level security is what makes a browser-side client
 * acceptable at all: the publishable key is public, and the policies in
 * supabase/migrations/0001_blog.sql are the actual boundary.
 */
export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requireSupabaseEnv()
  return createBrowserClient(url, publishableKey)
}
