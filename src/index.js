import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import Logo1 from "./Images/Logo1.jpg"

// Set favicon at runtime using the imported logo so the app shows the project's
// logo as the favicon without needing to place files into /public.
;(function setFavicon() {
  try {
    const href = Logo1
    const head = document.getElementsByTagName('head')[0]

    // Standard favicon
    let icon = document.querySelector("link[rel*='icon']")
    if (!icon) {
      icon = document.createElement('link')
      icon.rel = 'icon'
      head.appendChild(icon)
    }
    icon.type = 'image/png'
    icon.href = href

    // Apple touch icon
    let apple = document.querySelector("link[rel='apple-touch-icon']")
    if (!apple) {
      apple = document.createElement('link')
      apple.rel = 'apple-touch-icon'
      head.appendChild(apple)
    }
    apple.href = href
  } catch (err) {
    // If anything fails, don't block the app
    // console.warn('Failed to set favicon', err)
  }
})()

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
