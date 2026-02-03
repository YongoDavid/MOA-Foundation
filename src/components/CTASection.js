"use client"

import { Heart, Users, GraduationCap, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const CTASection = () => {
    const cards = [
        {
            icon: Users,
            title: "Become a Mentor",
            description: "Share your expertise and guide the next generation of African leaders.",
            action: "Apply Now",
            color: "royal-purple",
            gradient: "from-royal-purple/10 to-royal-purple/5",
            btnColor: "bg-royal-purple hover:bg-royal-purple/90"
        },
        {
            icon: GraduationCap,
            title: "Become a Mentee",
            description: "Gain access to world-class mentorship, resources, and a global network.",
            action: "Join Us",
            color: "teal",
            gradient: "from-teal/10 to-teal/5",
            btnColor: "bg-teal hover:bg-teal/90"
        },
        {
            icon: Heart,
            title: "Donate",
            description: "Support our mission to empower youth and foster peace across Africa.",
            action: "Give Support",
            color: "bright-orange",
            gradient: "from-bright-orange/10 to-bright-orange/5",
            btnColor: "bg-bright-orange hover:bg-bright-orange/90"
        }
    ]

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-dark-navy mb-6">
                        Get Involved
                    </h2>
                    <p className="text-xl font-sans text-medium-gray max-w-2xl mx-auto">
                        Be a part of the movement. Whether you want to lead, learn, or give, there's a place for you at MOA.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => {
                        const Icon = card.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className={`rounded-3xl p-8 bg-gradient-to-br ${card.gradient} border border-gray-100 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group`}
                            >
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className={`w-8 h-8 text-${card.color}`} />
                                </div>

                                <h3 className="text-2xl font-heading font-bold text-dark-navy mb-4">
                                    {card.title}
                                </h3>

                                <p className="text-medium-gray font-sans mb-8 flex-grow">
                                    {card.description}
                                </p>

                                <button className={`w-full py-4 rounded-xl text-white font-heading font-semibold ${card.btnColor} flex items-center justify-center gap-2 transition-colors shadow-md`}>
                                    {card.action}
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default CTASection
