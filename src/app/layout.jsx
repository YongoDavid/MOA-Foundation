import { Inter, Outfit, Big_Shoulders, Manrope } from "next/font/google"
import Preloader from "@/components/Preloader"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
})

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
  title: {
    default: "Moses of Africa Mentoring Foundation",
    template: "%s · Moses of Africa Mentoring Foundation",
  },
  description:
    "Moses of Africa Mentoring Foundation identifies and empowers young talent through mentorship, education, and leadership development across Africa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Moses of Africa Mentoring Foundation",
    title: "Moses of Africa Mentoring Foundation",
    description:
      "Don't Just Belong, Stand Out. Mentorship, education and leadership development for Africa's emerging leaders.",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moses of Africa Mentoring Foundation",
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
        className={`${inter.variable} ${outfit.variable} ${display.variable} ${body.variable} font-sans`}
      >
        <Preloader />
        {children}
      </body>
    </html>
  )
}
