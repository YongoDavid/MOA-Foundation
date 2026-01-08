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
      title: "PRIMARY OBJECTIVES",
      description: [
        "Youth empowerment and development: Support youth driven initiatives, innovation and empowering start-ups",
        "Education: To reintegrate out of school children and parents into the education system",
        "Mentorship: mentor Youths to discover their full potentials develop their skills and talents to become a valuable assert in their community.",
        "Gender inclusion: To promote gender inclusion for women and also people with special needs",
        "Global Peace advocacy: To advocate and facilitate social, economic and political stability for global peace",
        "Patriotism: Encouraging patriotism across the continent: Projecting Africa’s good image globally",
        "Fight political a-party: Encourage youths to participate in politics, vote during election and fight electoral mal-practice.",
      ],
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
    {
      icon: BookOpen,
      title: "SPECIFIC OBJECTIVES",
      description: [
        "Mentorship: Harnessing the youth potentials by pairing them with experience professionals",
        "Public enlightenment: creating awareness through mass media, training workshops, seminars, conferences and outreaches in schools, places of worships and market",
        "Advocacy for human and food security by promoting agricultural education as part way to creating employment opportunities and fight insecurity",
        "Advocacy for transparent free and fair election across the continent",
        "Advocacy for gender inclusion and awareness creation against gender based violence for the girl child",
        "Advocacy for human right protection, rule of law, equity, justice and fairness for all",
        "Advocacy for peace, across ethnic and religious lines and fight against tribalism, nepotism, ethnic and religious sentiment",
        "Advocacy for good governance, transparency and accountability from political appointees and government",
        "Education: Utilizing opportunities technology offers to arm the youths with the right knowledge and skills for personal growth and national development",
        "Innovation: Encouraging creativity and forward thinking solutions for sustainable self and national development",
      ],
      color: "text-teal",
      bgColor: "bg-teal/10",
    },
    {
      icon: Globe,
      title: "SDG ALIGNMENT",
      description: [
        " SDG 16: Promotion of world peace and inclusive societies through social, economic and political stability",
        " SDG 8: Promotion of accelerated sustainable all-inclusive economic growth and eradicate poverty creating employment opportunities across the continent",
        " SDG 4: Ensure sustainable all-inclusive and equitable quality education",
        " SDG 5: Achieve gender equality and empower female youths across the continent",
        " SDG 9: Industry, innovation, and Infrastructure: Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation",
        " SDG 16: Peace, Justice, and strong institution: promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institution for all",
        " SDG 1 & 2: End poverty and Hunger at all level ensuring food security, improved nutrition and promote sustainable agriculture",
        " SDG 8: Promotion of accelerated sustainable all-inclusive economic growth and eradicate",
      ],
      color: "text-bright-orange",
      bgColor: "bg-bright-orange/10",
    },
    {
      icon: Heart,
      title: "CORE VALUES",
      description: [
        "Integrity: Upholding the principal of honesty and transparency in all our activities",
        "Excellence: Striving for the highest standards in mentorship and leadership.",
        "Innovation: Encouraging creativity and forward thinking solutions.",
        "Empowerment: Providing tools and opportunities for youth to thrive",
        "Community: Strengthening bonds and fostering collaboration across the globe and within the continent",
      ],
      color: "text-royal-purple",
      bgColor: "bg-royal-purple/10",
    },
    {
      icon: Lightbulb,
      title: "KEY FOCUS AREAS",
      description: [
        "Leadership, Peace and Development: Advocating for good governance which fosters peaceful co- existence for sustainable development",
        "Education Support: Scholarship, tutoring, E leaning in TEC, AI and academic mentoring",
        "Mentorship Programs: Pairing youth with skilled, ethical and experienced professionals.",
        "Leadership Development: Training workshops, Seminars and conferences.",
        "Entrepreneurship and Innovation: Supporting young entrepreneurs and innovators with guidance and resources",
        "Community Engagement: Promoting volunteerism and social responsibility.",
      ],
      color: "text-teal",
      bgColor: "bg-teal/10",
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
            Using the 3D principles we empower young minds discover their potentials, develop their skills,
            and talents to be valuable in the global economy and become the best version of themselves for Africa's sustainable future.
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
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`inline-flex items-center justify-center w-14 h-14 p-0 rounded-xl ${program.bgColor} mb-4`}
                      whileHover={{
                        scale: 1.06,
                        transition: { duration: 0.25 },
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 4, -4, 0],
                          y: [0, -6, 0],
                          scale: [1, 1.04, 1],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                        className="flex items-center justify-center leading-none"
                      >
                        <IconComponent className={`h-8 w-8 block ${program.color}`} />
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                      className="text-xl font-poppins font-semibold text-dark-gray mb-4 text-center"
                    >
                      {program.title}
                    </motion.h3>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    className="font-inter text-medium-gray leading-relaxed mb-6"
                  >
                    {Array.isArray(program.description) ? (
                      <ul className="list-disc pl-6 space-y-2 text-base">
                        {program.description.map((d, i) => (
                          <li key={i} className="text-medium-gray">
                            {d}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{program.description}</p>
                    )}
                  </motion.div>

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