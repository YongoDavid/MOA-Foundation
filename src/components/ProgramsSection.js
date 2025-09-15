"use client"

import { useRef } from "react"
import { Users, BookOpen, Globe, Heart, Lightbulb, Target } from "lucide-react"
import { motion, useInView } from "framer-motion"

const ProgramsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const programs = [
    {
      icon: Users,
      title: "Mentorship Network",
      description:
        "Connect with Global leaders.",
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
    {
      icon: BookOpen,
      title: "Education",
      description:
        "Comprehensive programs and education to help young minds discover themeselves and be the best version of themselves.",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Globe,
      title: "Global Community",
      description:
        "Join a worldwide network of youths to bridge the gap and foster global impact.",
      color: "text-bright-orange",
      bgColor: "bg-bright-orange/10",
    },
    {
      icon: Heart,
      title: "Youth Development",
      description:
        "Specialized programs for young people focusing on leadership, identity, values and morals",
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
    {
      icon: Lightbulb,
      title: "Innovation Hub",
      description:
        "Fostering entrepreneurship and innovation to provide impactful and service driven leadership globally.",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Target,
      title: "Career Advancement",
      description:
        "Professional development resources, networking opportunities, and career guidance for community members.",
      color: "text-bright-orange",
      bgColor: "bg-bright-orange/10",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section id="programs" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-poppins font-bold text-royal-purple mb-6"
          >
            Aims & Objectives
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl font-inter text-medium-gray max-w-3xl mx-auto leading-relaxed"
          >
            Discover programs and schemes designed to empower individuals, preserve our nation, and build stronger
            communities across the globe.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {programs.map((program, index) => {
            const IconComponent = program.icon
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-8 bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border-0 group cursor-pointer h-full">
                  <motion.div
                    className={`inline-flex p-4 rounded-xl ${program.bgColor} mb-6`}
                    whileHover={{
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                    >
                      <IconComponent className={`h-8 w-8 ${program.color}`} />
                    </motion.div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="text-xl font-poppins font-semibold text-dark-gray mb-4"
                  >
                    {program.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    className="font-inter text-medium-gray leading-relaxed mb-6"
                  >
                    {program.description}
                  </motion.p>

                  {/* <motion.div whileHover={{ x: 10 }} transition={{ duration: 0.3 }}>
                    <button
                      className={`${program.color} hover:bg-transparent font-poppins font-semibold p-0 h-auto bg-transparent border-none cursor-pointer`}
                    >
                      Learn More →
                    </button>
                  </motion.div> */}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              y: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
          >
            {/* <button className="gradient-orange text-white font-poppins font-semibold px-8 py-4 rounded-full text-lg shadow-medium">
              Explore All Programs
            </button> */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default ProgramsSection;