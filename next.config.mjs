/** @type {import('next').NextConfig} */

// Blog media lives in Supabase Storage, so next/image has to be told that host
// is allowed. Without this, every DB-backed post image throws
// "hostname is not configured under images in your next.config".
//
// Derived from the environment rather than hardcoded: the project ref differs
// between any future staging project and production, and a hardcoded host
// would silently fail on one of them. Falsy env (a fresh clone with no
// .env.local) yields an empty list, which is correct — there are no remote
// images to allow.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  } catch {
    return null
  }
})()

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
}

export default nextConfig
