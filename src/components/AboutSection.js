"use client"

import { useRef, useState } from "react"
import { CheckCircle, Play } from "lucide-react"
import { motion, useInView } from "framer-motion"

const AboutSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const achievements = [
    "Established mentorship programs Nigeria",
    "Established mentorship programs Nigeria",
    "Established mentorship programs Nigeria",
    "Launched youth leadership initiatives",
    "Launched youth leadership initiatives",
    "Launched youth leadership initiatives",
  ]

  const aboutImages = [
    {
      src: "/igbo-elders-teaching-young-people-traditional-craf.jpg",
      alt: "Cultural Mentorship",
    },
    {
      src: "/modern-igbo-community-gathering-with-traditional-a.jpg",
      alt: "Community Gathering",
    },
    {
      src: "/igbo-youth-learning-traditional-music-and-instrume.jpg",
      alt: "Traditional Music Learning",
    },
  ]

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
              To empower and equip African youths with knowledge skills and resources needed to actively participate in politics and leadership, fostering a new generation of ethical, visionary and inclusive leaders commited to driving sustainable development and positive change across the continent.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg font-inter text-medium-gray leading-relaxed mb-8"
            >
              A future where African youths are at the forefront of governance and leadership, shaping policies, promoting transparency, and building resilient societies that reflect the aspirations of thier communities for equality, prosperity and justice
            </motion.p>

            <div className="space-y-4 mb-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
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
                  <span className="font-inter text-dark-gray">{achievement}</span>
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
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <img
                  src={aboutImages[currentImageIndex].src || "/placeholder.svg"}
                  alt={aboutImages[currentImageIndex].alt}
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-purple/20 to-transparent"></div>
              </motion.div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {aboutImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-4 rounded-full transition-all duration-300"
              >
                <Play className="h-8 w-8 text-white fill-current" />
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -10 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: -5 } : { opacity: 0, y: 50, rotate: -10 }}
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
                  15+
                </motion.div>
                <div className="text-sm font-inter text-medium-gray">Years of Impact</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -50, rotate: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: 5 } : { opacity: 0, y: -50, rotate: 10 }}
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
                <div className="text-sm font-inter text-medium-gray">Community Focused</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection;