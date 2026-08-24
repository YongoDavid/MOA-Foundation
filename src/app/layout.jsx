import { Inter, Outfit } from "next/font/google"
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

export const metadata = {
  metadataBase: new URL("https://mosesofafricafoundation.org"),
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
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
