"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const testimonials = [
    {
        id: 1,
        name: "Success Story",
        role: "Mentee",
        location: "Lagos, Nigeria",
        content:
            "The mentorship I received through MOA Foundation completely changed my career trajectory. My mentor provided guidance that helped me navigate the tech industry with confidence.",
        rating: 5,
        image: "/placeholder.svg?height=80&width=80&text=MOA",
    },
    {
        id: 2,
        name: "Partner Voice",
        role: "Community Partner",
        location: "Accra, Ghana",
        content:
            "Partnering with MOA has allowed us to reach more young people than ever before. Their commitment to integrity and excellence is exactly what Africa needs.",
        rating: 5,
        image: "/placeholder.svg?height=80&width=80&text=MOA",
    },
    {
        id: 3,
        name: "Mentor's Perspective",
        role: "Senior Mentor",
        location: "Nairobi, Kenya",
        content:
            "Being a mentor at MOA is incredibly rewarding. Watching these young leaders grow and start their own initiatives gives me hope for the future of our continent.",
        rating: 5,
        image: "/placeholder.svg?height=80&width=80&text=MOA",
    },
]

const TestimonialsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setDirection(1)
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    }

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection) => {
        setDirection(newDirection)
        setCurrentIndex((prev) => {
            if (newDirection === 1) {
                return (prev + 1) % testimonials.length
            } else {
                return (prev - 1 + testimonials.length) % testimonials.length
            }
        })
    }

    return (
        <section id="community" className="py-20 bg-gradient-to-br from-royal-purple/5 to-teal/5">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-royal-purple mb-6">Voices of Impact</h2>
                    <p className="text-xl font-sans text-medium-gray max-w-3xl mx-auto leading-relaxed">
                        Real stories from the real people building the future of Africa with us.
                    </p>
                </motion.div>

                <div className="relative">
                    <div className="overflow-hidden rounded-3xl bg-white shadow-soft hover:shadow-large transition-shadow duration-300 border border-gray-100">
                        <div className="relative min-h-[400px]">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 },
                                    }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={1}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = swipePower(offset.x, velocity.x);

                                        if (swipe < -swipeConfidenceThreshold) {
                                            paginate(1);
                                        } else if (swipe > swipeConfidenceThreshold) {
                                            paginate(-1);
                                        }
                                    }}
                                    className="p-6 md:p-16 cursor-grab active:cursor-grabbing absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="max-w-4xl mx-auto text-center">
                                        <motion.div
                                            animate={{ rotate: [0, 5, -5, 0] }}
                                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                                            className="inline-flex p-3 bg-royal-purple/10 rounded-full mb-6 md:mb-8"
                                        >
                                            <Quote className="h-6 w-6 md:h-8 md:w-8 text-royal-purple" />
                                        </motion.div>

                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.2 }}
                                            className="text-base sm:text-lg md:text-2xl font-sans text-dark-gray leading-relaxed mb-6 md:mb-8 italic"
                                        >
                                            "{testimonials[currentIndex].content}"
                                        </motion.p>

                                        <div className="flex items-center justify-center gap-1 mb-6">
                                            {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                                                >
                                                    <Star className="h-5 w-5 text-bright-orange fill-current" />
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.6 }}
                                            className="flex flex-col md:flex-row items-center justify-center gap-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center border-2 border-teal">
                                                <span className="font-heading font-bold text-teal text-xl">
                                                    {testimonials[currentIndex].name.charAt(0)}
                                                </span>
                                            </div>

                                            <div className="text-center md:text-left">
                                                <div className="font-heading font-semibold text-dark-gray text-base md:text-lg">
                                                    {testimonials[currentIndex].name}
                                                </div>
                                                <div className="font-sans text-sm md:text-base text-medium-gray">{testimonials[currentIndex].role}</div>
                                                <div className="font-sans text-xs md:text-sm text-teal">{testimonials[currentIndex].location}</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Buttons (Hidden on small screens since we have swipe) */}
                        <button
                            onClick={() => paginate(-1)}
                            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-medium transition-all duration-300 group hover:scale-110 z-10"
                            aria-label="Previous Testimonial"
                        >
                            <ChevronLeft className="h-6 w-6 text-royal-purple" />
                        </button>
                        <button
                            onClick={() => paginate(1)}
                            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 rounded-full shadow-medium transition-all duration-300 group hover:scale-110 z-10"
                            aria-label="Next Testimonial"
                        >
                            <ChevronRight className="h-6 w-6 text-royal-purple" />
                        </button>

                        {/* Indicators */}
                        <div className="flex justify-center gap-3 mt-8">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setDirection(index > currentIndex ? 1 : -1)
                                        setCurrentIndex(index)
                                    }}
                                    className="p-2"
                                    aria-label={`Go to testimonial ${index + 1}`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-royal-purple scale-125" : "bg-royal-purple/30 hover:bg-royal-purple/50"
                                        }`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TestimonialsCarousel;