import { Analytics } from "@vercel/analytics/next"
import { Big_Shoulders, Manrope } from "next/font/google"
import Preloader from "@/components/Preloader"
import { SITE } from "@/lib/site"
import UtilityStrip from "@/components/shell/UtilityStrip"
import SiteHeader from "@/components/shell/SiteHeader"
import SiteFooter from "@/components/shell/SiteFooter"
import "./globals.css"

// Redesign typefaces (spec v2.0 §2). Two families, no third.
// Big Shoulders Display carries every heading, numeral and uppercase label;
// Manrope carries body, meta and interface text.
const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
})

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
})

export const metadata = {
  // .env.example documents NEXT_PUBLIC_SITE_URL as driving canonical and OG
  // URLs, so it has to actually be read — otherwise every Vercel preview emits
  // production canonicals and og:urls pointing at the live site. The literal is
  // the fallback so local runs and a missing var still behave.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mosesofafricafoundation.org"
  ),
  // public/index.html carried the only <link rel="manifest"> and was deleted
  // with CRA, so without this the rewritten manifest is referenced by nothing.
  manifest: "/manifest.json",
  // Legal name confirmed by the client 27 Aug 2026: "Moses Mentoring
  // Foundation". It reads from SITE so the tab title, the OG card and the
  // wordmark in the header can never disagree again — they did for a month.
  // The DOMAIN keeps "mosesofafrica" and that is correct; it is the address,
  // not the name.
  title: {
    default: SITE.legalName,
    template: `%s · ${SITE.legalName}`,
  },
  description: `${SITE.legalName} identifies and empowers young talent through mentorship, education, and leadership development across Africa.`,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE.legalName,
    title: SITE.legalName,
    description:
      "Don't Just Belong, Stand Out. Mentorship, education and leadership development for Africa's emerging leaders.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.legalName,
    description:
      "Mentorship, education and leadership development for Africa's emerging leaders.",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Without JS the preloader can never dismiss itself and would hide
            the site permanently. The page beneath is fully server-rendered, so
            hiding the overlay outright is the correct no-JS behaviour. */}
        <noscript>
          <style>{`.moa-preloader{display:none !important}`}</style>
        </noscript>
      </head>
      <body
        className={`${display.variable} ${body.variable} font-body`}
      >
        <Preloader />
        {/* Skip link must be the first focusable element (spec §12). */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:bg-ink-900 focus:px-4 focus:py-3 focus:font-body focus:text-[12px] focus:font-bold focus:uppercase focus:tracking-[.09em] focus:text-white"
        >
          Skip to main content
        </a>
        <UtilityStrip />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        {/* Vercel Analytics. Cookieless and no personal data, so it needs no
            consent banner. It reports only from a Vercel deployment — locally
            and in any other host it is inert, which is why nothing about it
            shows up in the smoke run. */}
        <Analytics />
      </body>
    </html>
  )
}
