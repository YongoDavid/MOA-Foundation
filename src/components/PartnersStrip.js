"use client"

import { motion } from "framer-motion"

const PartnersStrip = () => {
    const partners = [
        { name: "United Nations", opacity: "opacity-60" },
        { name: "African Union", opacity: "opacity-60" },
        { name: "Commonwealth", opacity: "opacity-50" },
        { name: "UNESCO", opacity: "opacity-60" },
        { name: "Save the Children", opacity: "opacity-50" },
    ]

    return (
        <section className="py-8 bg-gray-50 border-b border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <span className="text-sm font-heading font-semibold text-medium-gray whitespace-nowrap uppercase tracking-wider">
                    Trusted Partners & Collaborators
                </span>

                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 w-full md:w-auto grayscale">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`text-lg md:text-xl font-heading font-bold text-gray-400 ${partner.opacity} hover:opacity-100 hover:text-royal-purple transition-all cursor-default select-none`}
                        >
                            {partner.name}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PartnersStrip
