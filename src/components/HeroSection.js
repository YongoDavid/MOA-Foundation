"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image0 from "../Images/MOA.jpg";
import Image1 from "../Images/MOA1.jpg";
import Image2 from "../Images/MOA2.jpg";
import Image3 from "../Images/MOA3.jpg";
import Image4 from "../Images/MOA4.jpg";
import Image5 from "../Images/MOA5.jpg";
import Image6 from "../Images/MOA6.jpg";

const heroImages = [
  {
    src: Image0,
    alt: "Community Mentorship",
  },
  {
    src: Image1,
    alt: "Community Mentorship",
  },
  {
    src: Image2,
    alt: "Community Mentorship",
  },
  {
    src: Image3,
    alt: "Community Mentorship",
  },
  {
    src: Image4,
    alt: "Community Mentorship",
  },
  {
    src: Image5,
    alt: "Community Mentorship",
  },
  {
    src: Image6,
    alt: "Community Mentorshipcc",
  },
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + heroImages.length) % heroImages.length
    );
  };

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Reduced gradient opacity slightly for cleaner look, but kept dark enough for text */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30 z-10" />
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 20, ease: "linear", repeat: 0 }}
              src={heroImages[currentImage].src || "/placeholder.svg"}
              alt={heroImages[currentImage].alt}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prevImage}
          className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md hover:bg-white/30 p-4 rounded-full transition-all duration-300 group touch-manipulation border border-white/20"
          aria-label="Previous Image"
        >
          <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextImage}
          className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md hover:bg-white/30 p-4 rounded-full transition-all duration-300 group touch-manipulation border border-white/20"
          aria-label="Next Image"
        >
          <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </button>

        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className="p-2 group focus:outline-none"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`w-3 h-3 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentImage
                  ? "bg-white scale-125"
                  : "bg-white/50 group-hover:bg-white/75"
                  }`}
              />
            </button>
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
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Star className="h-3 w-3 md:h-4 md:w-4 text-bright-orange fill-current" />
            </motion.div>
            <span className="text-xs md:text-sm font-heading font-semibold text-dark-gray">
              Don't Just Belong, Stand Out
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-white leading-tight mb-4 md:mb-6"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="block"
            >
              Africa’s Emerging Leaders for
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="block text-teal"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
            >
              Excellence
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-base md:text-lg lg:text-xl font-sans text-white leading-relaxed mb-6 md:mb-8 max-w-2xl"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
          >
            Moses of Africa Mentoring Foundation identifies and empowers young talent through mentorship, education, and leadership development. We connect aspiring youth with experienced mentors to foster growth, innovation, and sustainable development across the continent.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4"
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-8 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/30"
          ></motion.div>
        </div>
      </div>
    </section>
  );
}
