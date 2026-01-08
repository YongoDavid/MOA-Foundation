import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronUp } from "lucide-react"

// Props:
// - threshold: vertical px to show button after scrolling (default 300)
// - minContentRatio: require document height > viewport * minContentRatio before enabling the button (default 1.5)
export default function ScrollToTopButton({ threshold = 300, minContentRatio = 1.5 }) {
  const [visible, setVisible] = useState(false)
  const [enabled, setEnabled] = useState(true)

  // Determine whether the page is long enough to need a scroll-to-top button
  useEffect(() => {
    const checkContent = () => {
      const doc = document.documentElement
      const contentHeight = doc ? doc.scrollHeight : 0
      const viewport = window.innerHeight || 0
      setEnabled(contentHeight > viewport * minContentRatio)
    }
    checkContent()
    window.addEventListener("resize", checkContent, { passive: true })
    return () => window.removeEventListener("resize", checkContent)
  }, [minContentRatio])

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }
    const onScroll = () => setVisible(window.pageYOffset > threshold)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold, enabled])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <AnimatePresence>
      {enabled && visible && (
        <motion.button
          aria-label="Scroll to top"
          onClick={handleClick}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.24 }}
          className="fixed right-4 z-50 lg:hidden"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <div className="h-12 w-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors">
            <ChevronUp className="h-5 w-5" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
