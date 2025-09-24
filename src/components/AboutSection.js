"use client";
import { useEffect } from "react";
import { useRef, useState } from "react";
import { CheckCircle, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image4 from "../Images/MOA4.jpg";
import Image5 from "../Images/MOA5.jpg";
import Image6 from "../Images/MOA6.jpg";
import Image7 from "../Images/MOA7.jpg";
import Image8 from "../Images/MOA8.jpg";
import Image9 from "../Images/MOA9.jpg";
import Image10 from "../Images/MOA10.jpg";
import Image11 from "../Images/MOA11.jpg";
import Image12 from "../Images/MOA12.jpg";
import Image13 from "../Images/MOA13.jpg";
import Image14 from "../Images/MOA14.jpg";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
    }, 5000);
    return () => clearInterval(timer);
  });

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % aboutImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + aboutImages.length) % aboutImages.length
    );
  };

  const achievements = [
    "Established mentorship programs Nigeria",
    "Established mentorship programs Nigeria",
    "Established mentorship programs Nigeria",
    "Launched youth leadership initiatives",
    "Launched youth leadership initiatives",
    "Launched youth leadership initiatives",
  ];

  const aboutImages = [
    {
      src: Image4,
      alt: "Mentorship",
    },
    {
      src: Image5,
      alt: "Mentorship",
    },
    {
      src: Image6,
      alt: "Mentorship",
    },
    {
      src: Image8,
      alt: "Mentorship",
    },
    {
      src: Image9,
      alt: "Mentorship",
    },
    {
      src: Image10,
      alt: "Mentorship",
    },
    {
      src: Image12,
      alt: "Mentorship",
    },
    {
      src: Image13,
      alt: "Mentorship",
    },
    {
      src: Image14,
      alt: "Mentorship",
    },
  ];

  return (
    <section id="about" className="py-20 bg-teal/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-poppins font-bold text-royal-purple mb-6"
            >
              Building Bridges Across Generations
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg font-inter text-medium-gray leading-relaxed mb-8"
            >
              To empower and equip African youths with knowledge skills and
              resources needed to actively participate in politics and
              leadership, fostering a new generation of ethical, visionary and
              inclusive leaders commited to driving sustainable development and
              positive change across the continent.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg font-inter text-medium-gray leading-relaxed mb-8"
            >
              A future where African youths are at the forefront of governance
              and leadership, shaping policies, promoting transparency, and
              building resilient societies that reflect the aspirations of thier
              communities for equality, prosperity and justice
            </motion.p>

            <div className="space-y-4 mb-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                  }
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 10, transition: { duration: 0.3 } }}
                  className="flex items-start gap-3"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 5,
                      ease: "easeInOut",
                    }}
                  >
                    <CheckCircle className="h-6 w-6 text-teal flex-shrink-0 mt-0.5" />
                  </motion.div>
                  <span className="font-inter text-dark-gray">
                    {achievement}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-large">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  // transition={{ duration: 0.8 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-royal-purple/20 to-transparent"></div>
                  <img
                    src={
                      aboutImages[currentImageIndex].src || "/placeholder.svg"
                    }
                    alt={aboutImages[currentImageIndex].alt}
                    className="w-full h-[600px] object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              <button
                onClick={prevImage}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 md:p-3 rounded-full transition-all duration-300 group"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 md:p-3 rounded-full transition-all duration-300 group"
              >
                <ChevronRight />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {aboutImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -10 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, rotate: -5 }
                  : { opacity: 0, y: 50, rotate: -10 }
              }
              transition={{ duration: 0.8, delay: 1 }}
              whileHover={{
                rotate: 0,
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
              className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-large"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                  className="text-3xl font-poppins font-bold text-teal"
                >
                  2+
                </motion.div>
                <div className="text-sm font-inter text-medium-gray">
                  Years of Impact
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -50, rotate: 10 }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, rotate: 5 }
                  : { opacity: 0, y: -50, rotate: 10 }
              }
              transition={{ duration: 0.8, delay: 1.2 }}
              whileHover={{
                rotate: 0,
                scale: 1.05,
                transition: { duration: 0.3 },
              }}
              className="absolute -top-8 -right-8 bg-white p-6 rounded-xl shadow-large"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 4,
                    ease: "easeInOut",
                  }}
                  className="text-3xl font-poppins font-bold text-bright-orange"
                >
                  100%
                </motion.div>
                <div className="text-sm font-inter text-medium-gray">
                  Community Focused
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
