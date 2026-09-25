// Site-wide settings (spec v2.0 §11, SiteSettings).
//
// One source for anything that appears in more than one place. The old site
// had the phone number in two components with different values — the footer
// showed a placeholder while the donation drawer showed the real one.

export const SITE = {
  legalName: "Moses Mentoring Foundation",
  tagline: "Don't just belong, stand out.",
  subtitle: "Leadership · Peace · Development",
  address: "House B61 Supercell Estate, Apo, Abuja, F.C.T., Nigeria",
  location: "Abuja, F.C.T. · Nigeria",
  phone: "+234 803 731 5490",
  email: "mosesofafrica333@gmail.com",
  officeHours: "Monday to Friday, 9am – 5pm WAT",
  /** Rendered beside the contact submit. A content field so staff can change the promise. */
  replyPromise: "We reply within two working days.",
  social: [
    { label: "Instagram", url: "#" },
    { label: "LinkedIn", url: "#" },
    { label: "X", url: "#" },
    { label: "Facebook", url: "#" },
  ],
} as const

/** Header navigation. DONATE is rendered separately as the primary action. */
export const NAV = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const

/**
 * Which nav item is current for a given path.
 *
 * /programs/apply and /programs/mentor both mark PROGRAMS current (spec §3) —
 * they are programme sub-pages, not siblings, and leaving the nav with nothing
 * highlighted on those two routes would read as a broken state.
 */
export function currentNavHref(pathname: string): string | null {
  if (pathname === "/") return null
  const match = NAV.find(
    (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
  )
  return match?.href ?? null
}

export const FOOTER_COLUMNS = [
  {
    heading: "The Foundation",
    links: [
      { label: "About", href: "/about" },
      { label: "Programs", href: "/programs" },
      { label: "Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { label: "Apply as a mentee", href: "/programs/apply" },
      { label: "Volunteer as a mentor", href: "/programs/mentor" },
      { label: "Partner with us", href: "/contact" },
      { label: "Donate", href: "/donate" },
    ],
  },
] as const
