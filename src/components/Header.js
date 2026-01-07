"use client"

import { useState, useEffect } from "react"
import { Menu, X, Grid3X3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BookNowModal from "./book-now-modal"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isBookNowOpen, setIsBookNowOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "ABOUT US", href: "#about" },
    { name: "BLOG", href: "#blog" },
    { name: "PROGRAMS", href: "#programs" },
    { name: "PROJECTS", href: "#projects" },
    { name: "LOGIN", href: "#login" },
    { name: "CONTACT", href: "#contact" },
    { name: "REGISTER", href: "#register" },
    { name: "GALLERY", href: "#gallery" },
    { name: "DONATION", href: "#donation" },
  ]

  return (
    <>
      {/* Top Info Bar (hidden on scroll) */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            key="top-info"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-black/90 text-white py-2 px-4 sm:py-3 sm:px-6"
          >
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
                  🌟
                </motion.div>
                <span className="font-poppins text-xs sm:text-sm font-medium">Welcome to Umuigbo Worldwide</span>
              </div>
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 font-bold">📍</span>
                  <span className="font-poppins text-xs sm:text-sm font-medium">+234 8037315490</span>
                </div>
                <div className="hidden sm:flex items-center space-x-4">
                  {[
                    { icon: "f", label: "Facebook" },
                    { icon: "in", label: "LinkedIn" },
                    { icon: "𝕏", label: "Twitter" },
                    { icon: "▶", label: "YouTube" },
                  ].map((social, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-white hover:text-orange-accent transition-colors text-xs"
                    >
                      <span className="text-xs">{social.icon}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header (hidden on scroll) */}
      <AnimatePresence>
        {!scrolled && (
          <motion.header
            key="main-header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className={`sticky top-0 w-full z-50 transition-all duration-300 ${"bg-white shadow-soft"}`}
          >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-24">
            {/* Left Icons (mobile: visible on left; desktop: ordered to the right) */}
            <div className="flex items-center space-x-3 order-1 md:order-3">
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                whileHover={{ rotate: 90 }}
                type="button"
                onClick={() => setIsBookNowOpen(true)}
                className="flex items-center justify-center border border-light-gray hover:bg-gray-100 p-2"
                aria-label="Book Now"
              >
                <Grid3X3 className="h-5 w-5 text-dark-gray" />
              </motion.button>
            </div>

            {/* Logo (center on mobile, left on md+) */}
            <motion.div whileHover={{ scale: 1.05 }} className="order-2 md:order-1 flex-1 flex items-center justify-center md:justify-start">
              <motion.img src="/umuigbo-colorful-logo-icon.jpg" alt="UMUIGBO Logo" className="h-10 w-10 md:h-12 md:w-12" />
              <motion.div className="ml-2 hidden md:flex flex-col">
                <div className="text-sm md:text-base font-poppins font-bold text-dark-navy">UMUIGBO</div>
                <div className="text-xs md:text-sm font-poppins font-medium text-orange-accent">Worldwide</div>
              </motion.div>
            </motion.div>

            {/* Navigation Menu (desktop) */}
            <nav className="hidden lg:flex items-center space-x-1 order-4 md:order-2 md:ml-6">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 * index }}
                  whileHover={{
                    scale: 1.05,
                    color: "#6D28D9",
                    transition: { duration: 0.2 },
                  }}
                  className="font-poppins font-medium text-sm text-dark-gray hover:text-royal-purple px-3 py-2 rounded-md hover:bg-royal-purple/10 transition-all duration-300"
                >
                  {item.name}
                </motion.a>
              ))}
            </nav>

            {/* Hamburger (always on right) */}
            <div className="order-3 md:order-4">
              <motion.div whileTap={{ scale: 0.9 }}>
                <button type="button" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-6 w-6 text-dark-gray" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="h-6 w-6 text-dark-gray" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden py-4 border-t border-light-gray overflow-hidden"
              >
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ x: 10 }}
                      className="font-poppins font-medium text-dark-gray hover:text-royal-purple px-4 py-3 rounded-md hover:bg-royal-purple/10 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    onClick={() => {
                      setIsBookNowOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="mt-4 mx-4 w-full py-3 bg-orange-accent text-white rounded-full font-poppins font-semibold hover:bg-orange-accent/90"
                  >
                    Book Now
                  </motion.button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
        )}
      </AnimatePresence>

      {/* Book Now Modal */}
      <BookNowModal isOpen={isBookNowOpen} onClose={() => setIsBookNowOpen(false)} />
    </>
  )
}
