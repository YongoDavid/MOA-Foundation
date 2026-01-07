"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function BookNowModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    setFormData({ name: "", email: "", message: "" })
    onClose()
  }

  const nameRef = useRef(null)

  // Prevent background scrolling and focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      setTimeout(() => nameRef.current?.focus?.(), 120)
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal Sidebar */}
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed left-0 top-0 h-full w-96 max-h-screen bg-gray-900 text-white z-[10000] overflow-y-auto shadow-2xl p-8 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="sticky top-0 flex justify-end pb-4 bg-transparent z-10">
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white hover:text-orange-accent transition-colors"
                aria-label="Close booking modal"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Modal Content */}
            <div className="pt-2">
              <div className="flex items-center justify-center mb-4">
                <img src="/umuigbo-colorful-logo-icon.jpg" alt="UMUIGBO Logo" className="h-12 w-12" />
              </div>
              {/* Book Now Form Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h2 className="text-2xl font-poppins font-bold mb-6">Book Now</h2>

                <form onSubmit={handleSubmit} className="space-y-4 mb-8">
                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      ref={nameRef}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <textarea
                      name="message"
                      placeholder="Text"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors resize-none"
                    />
                  </div>

                  {/* Send Now Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-32 px-6 py-3 bg-red-600 text-white font-poppins font-bold rounded-md hover:bg-red-700 transition-all duration-300 shadow-md"
                    >
                      SEND NOW
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Contact Info Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="pt-6 border-t border-gray-800"
              >
                <h3 className="text-lg font-poppins font-bold mb-4">Contact Info</h3>

                <div className="text-sm text-gray-300 space-y-2 mb-4">
                  <div>Suite 102, Nwukpabi Plaza Number 14</div>
                  <div>Waziri</div>
                  <div>+234 8037315490</div>
                  <div>info@umuigboworldwide.com</div>
                </div>

                <div className="flex space-x-3 mt-2">
                  {[
                    { icon: "f", label: "Facebook" },
                    { icon: "@", label: "Instagram" },
                    { icon: "in", label: "LinkedIn" },
                    { icon: "𝕏", label: "Twitter" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-700 text-gray-300 hover:border-red-600 hover:text-red-600 transition-colors"
                      aria-label={social.label}
                    >
                      <span className="text-sm font-bold">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    , document.body
  )
}
