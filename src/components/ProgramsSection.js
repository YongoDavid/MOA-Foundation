"use client"

import { useRef, useState } from "react"
import { Users, BookOpen, Globe, Lightbulb, TrendingUp, Scale, Zap, GraduationCap, Wheat } from "lucide-react"
import { motion, useInView, AnimatePresence } from "framer-motion"

const ProgramsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState("specific")

  // Feature Grid Items (Primary Objectives)
  const primaryFeatures = [
    {
      icon: Users,
      title: "Youth Empowerment",
      description: "Supporting youth-driven initiatives, innovation, and empowering starts-ups to drive economic growth.",
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
    {
      icon: GraduationCap,
      title: "Education & Reintegration",
      description: "Reintegrating out-of-school children and parents into the education system for a brighter future.",
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Lightbulb,
      title: "Mentorship",
      description: "Mentoring youths to discover their full potential, skills, and talents to become valuable assets.",
      color: "text-bright-orange",
      bgColor: "bg-bright-orange/10",
    },
    {
      icon: Globe,
      title: "Global Peace Advocacy",
      description: "Advocating for social, economic, and political stability to foster global peace and prosperity.",
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
  ]

  // Tab Content Data
  const tabContent = {
    specific: {
      title: "Specific Objectives",
      items: [
        "Harnessing youth potential through professional mentorship.",
        "Public enlightenment via seminars, workshops, and outreaches.",
        "Advocacy for human and food security via agricultural education.",
        "Promoting transparent, free, and fair elections across Africa.",
        "Championing gender inclusion and fighting gender-based violence.",
        "Advocating for human rights, rule of law, equity, and justice.",
        "Fostering peace across ethnic and religious lines.",
        "Demanding good governance, transparency, and accountability.",
        "Utilizing technology for personal growth and national development.",
        "Encouraging creativity and forward-thinking solutions."
      ]
    },
    sdg: {
      title: "SDG Alignment",
      items: [
        { icon: Scale, text: "SDG 16: Peace, Justice & Strong Institutions" },
        { icon: TrendingUp, text: "SDG 8: Decent Work & Economic Growth" },
        { icon: BookOpen, text: "SDG 4: Quality Education" },
        { icon: Users, text: "SDG 5: Gender Equality" },
        { icon: Zap, text: "SDG 9: Industry, Innovation & Infrastructure" },
        { icon: Wheat, text: "SDG 1 & 2: No Poverty & Zero Hunger" },
      ]
    },
    values: {
      title: "Core Values",
      items: [
        { title: "Integrity", desc: "Upholding honesty and transparency." },
        { title: "Excellence", desc: "Striving for the highest mentorship standards." },
        { title: "Innovation", desc: "Encouraging creativity and new solutions." },
        { title: "Empowerment", desc: "Providing tools for youth to thrive." },
        { title: "Community", desc: "Fostering collaboration across the continent." },
      ]
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id="programs" style={{ scrollMarginTop: '5rem' }} className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-royal-purple mb-6">
            Aims & Objectives
          </h2>
          <p className="text-xl font-sans text-medium-gray max-w-3xl mx-auto leading-relaxed">
            Using the 3D principles, we empower young minds to discover their potentials and develop their skills
            to become the best version of themselves for Africa's sustainable future.
          </p>
        </motion.div>

        {/* Feature Grid (Primary Objectives) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {primaryFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 hover:shadow-medium transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-heading font-bold text-dark-gray mb-3">{feature.title}</h3>
                <p className="text-sm font-sans text-medium-gray leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs Section */}
        <div className="max-w-5xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto md:flex-wrap md:justify-center gap-4 mb-10 pb-4 px-4 -mx-4 md:px-0 md:mx-0 md:pb-0 scrollbar-hide snap-x">
            {[
              { id: 'specific', label: 'Specific Objectives' },
              { id: 'sdg', label: 'SDG Alignment' },
              { id: 'values', label: 'Core Values' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-full font-heading font-semibold text-sm md:text-base whitespace-nowrap transition-all duration-300 snap-center shrink-0 ${activeTab === tab.id
                  ? "text-white bg-royal-purple shadow-md"
                  : "text-medium-gray bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-royal-purple -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-heading font-bold text-dark-gray mb-8 text-center">
                  {tabContent[activeTab].title}
                </h3>

                {activeTab === 'specific' && (
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
                  >
                    {tabContent.specific.items.map((item, i) => (
                      <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-teal flex-shrink-0" />
                        <span className="font-sans text-medium-gray leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}

                {activeTab === 'sdg' && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {tabContent.sdg.items.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={i}
                          variants={itemVariants}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-6 rounded-xl shadow-soft flex flex-col items-center text-center gap-4 hover:shadow-md transition-all"
                        >
                          <div className="w-12 h-12 rounded-full bg-bright-orange/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-bright-orange" />
                          </div>
                          <span className="font-heading font-semibold text-dark-gray">{item.text}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}

                {activeTab === 'values' && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {tabContent.values.items.map((item, i) => (
                      <motion.div
                        key={i}
                        variants={itemVariants}
                        className="bg-white p-6 rounded-xl border-l-4 border-royal-purple shadow-sm hover:shadow-md transition-all"
                      >
                        <h4 className="font-heading font-bold text-lg text-royal-purple mb-2">{item.title}</h4>
                        <p className="font-sans text-medium-gray text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProgramsSection