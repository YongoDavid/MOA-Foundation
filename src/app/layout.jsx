import "./globals.css"

export const metadata = {
  title: "Moses of Africa Mentoring Foundation",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
