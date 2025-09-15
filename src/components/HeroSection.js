"use client"

import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
// import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Image0 from "../Images/MOA.jpg"
import Image1 from "../Images/MOA1.jpg"
import Image2 from "../Images/MOA2.jpg"
import Image3 from "../Images/MOA3.jpg"
import Image4 from "../Images/MOA4.jpg"
import Image5 from "../Images/MOA5.jpg"
import Image6 from "../Images/MOA6.jpg"

const heroImages = [
  {
    src: Image0,
    alt: "Igbo Cultural Festival",
  },
  {
    src: Image1,
    alt: "Cultural Mentorship",
  },
  {
    src: Image2,
    alt: "Community Gathering",
  },
  {
    src: Image3,
    alt: "Cultural Education",
  },
  {
    src: Image4,
    alt: "Cultural Education",
  },
  {
    src: Image5,
    alt: "Cultural Education",
  },
  {
    src: Image6,
    alt: "Cultural Education",
  },
]

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <section className="relative min-h-screen flex items-center bg-royal-purple overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10" />
            <img
              src={heroImages[currentImage].src || "/placeholder.svg"}
              alt={heroImages[currentImage].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prevImage}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 md:p-3 rounded-full transition-all duration-300 group"
        >
          <ChevronLeft className="h-4 w-4 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 md:p-3 rounded-full transition-all duration-300 group"
        >
          <ChevronRight className="h-4 w-4 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentImage ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 z-20">
        <div className="max-w-3xl bg-black/20 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-6 md:mb-8 shadow-soft"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Star className="h-3 w-3 md:h-4 md:w-4 text-bright-orange fill-current" />
            </motion.div>
            <span className="text-xs md:text-sm font-poppins font-semibold text-dark-gray">
              LEADERSHIP, PEACE AND DEVELOPMENT
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-poppins font-extrabold text-white leading-tight mb-4 md:mb-6"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="block"
            >
              Impacting Youths,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block text-teal"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
            >
              Building the Future
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-base md:text-lg lg:text-xl font-inter text-white leading-relaxed mb-6 md:mb-8 max-w-2xl"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
          >
            African youths are at the forefront of governance and leadership, shaping policies, promoting transparency, and building resillient societies that reflect the aspirations of thier communities for equality, prosperity and justice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          >
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-8 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/30"
          >
          </motion.div>
        </div>
      </div>
    </section>
  )
};