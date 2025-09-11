// "use client"

// import { useState, useEffect } from "react"
// import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"

// const testimonials = [
//   {
//     id: 1,
//     name: "Adaora Okafor",
//     role: "Cultural Ambassador",
//     location: "London, UK",
//     content:
//       "UMUIGBO Worldwide has been instrumental in helping me connect with my roots while building a successful career abroad. The mentorship program opened doors I never knew existed.",
//     rating: 5,
//     image: "/placeholder.svg?height=80&width=80&text=AO",
//   },
//   {
//     id: 2,
//     name: "Chukwudi Eze",
//     role: "Tech Entrepreneur",
//     location: "Toronto, Canada",
//     content:
//       "The innovation hub provided me with the network and resources to launch my startup. I'm proud to be building technology solutions while staying connected to our cultural values.",
//     rating: 5,
//     image: "/placeholder.svg?height=80&width=80&text=CE",
//   },
//   {
//     id: 3,
//     name: "Ngozi Amadi",
//     role: "Youth Leader",
//     location: "Lagos, Nigeria",
//     content:
//       "Through the youth development program, I've learned to embrace my identity with pride and lead initiatives that impact my community. The global network is truly inspiring.",
//     rating: 5,
//     image: "/placeholder.svg?height=80&width=80&text=NA",
//   },
//   {
//     id: 4,
//     name: "Emeka Okonkwo",
//     role: "Cultural Educator",
//     location: "New York, USA",
//     content:
//       "The cultural education resources have been invaluable in my work teaching Igbo language and traditions. UMUIGBO's commitment to preservation is unmatched.",
//     rating: 5,
//     image: "/placeholder.svg?height=80&width=80&text=EO",
//   },
// ]

// const TestimonialsCarousel = () => {
//   const [currentIndex, setCurrentIndex] = useState(0)
//   const [direction, setDirection] = useState(0)

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setDirection(1)
//       setCurrentIndex((prev) => (prev + 1) % testimonials.length)
//     }, 5000)
//     return () => clearInterval(timer)
//   }, [])

//   const slideVariants = {
//     enter: (direction) => ({
//       x: direction > 0 ? 1000 : -1000,
//       opacity: 0,
//     }),
//     center: {
//       zIndex: 1,
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction) => ({
//       zIndex: 0,
//       x: direction < 0 ? 1000 : -1000,
//       opacity: 0,
//     }),
//   }

//   const paginate = (newDirection) => {
//     setDirection(newDirection)
//     setCurrentIndex((prev) => {
//       if (newDirection === 1) {
//         return (prev + 1) % testimonials.length
//       } else {
//         return (prev - 1 + testimonials.length) % testimonials.length
//       }
//     })
//   }

//   return (
//     <section className="py-20 bg-gradient-to-br from-royal-purple/5 to-teal/5">
//       <div className="max-w-6xl mx-auto px-6">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl md:text-5xl font-poppins font-bold text-royal-purple mb-6">Community Voices</h2>
//           <p className="text-xl font-inter text-medium-gray max-w-3xl mx-auto leading-relaxed">
//             Hear from members who have transformed their lives through our programs and community support.
//           </p>
//         </motion.div>

//         <div className="relative">
//           <div className="overflow-hidden rounded-2xl bg-white shadow-large">
//             <AnimatePresence initial={false} custom={direction}>
//               <motion.div
//                 key={currentIndex}
//                 custom={direction}
//                 variants={slideVariants}
//                 initial="enter"
//                 animate="center"
//                 exit="exit"
//                 transition={{
//                   x: { type: "spring", stiffness: 300, damping: 30 },
//                   opacity: { duration: 0.2 },
//                 }}
//                 className="p-12 md:p-16"
//               >
//                 <div className="max-w-4xl mx-auto text-center">
//                   <motion.div
//                     animate={{ rotate: [0, 5, -5, 0] }}
//                     transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
//                     className="inline-flex p-3 bg-royal-purple/10 rounded-full mb-8"
//                   >
//                     <Quote className="h-8 w-8 text-royal-purple" />
//                   </motion.div>

//                   <motion.p
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.2 }}
//                     className="text-xl md:text-2xl font-inter text-dark-gray leading-relaxed mb-8 italic"
//                   >
//                     "{testimonials[currentIndex].content}"
//                   </motion.p>

//                   <div className="flex items-center justify-center gap-1 mb-6">
//                     {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
//                       <motion.div
//                         key={i}
//                         initial={{ opacity: 0, scale: 0 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
//                       >
//                         <Star className="h-5 w-5 text-bright-orange fill-current" />
//                       </motion.div>
//                     ))}
//                   </div>

//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.6 }}
//                     className="flex items-center justify-center gap-4"
//                   >
//                     <motion.img
//                       whileHover={{ scale: 1.1 }}
//                       src={testimonials[currentIndex].image}
//                       alt={testimonials[currentIndex].name}
//                       className="w-16 h-16 rounded-full object-cover border-4 border-teal/20"
//                     />
//                     <div className="text-left">
//                       <div className="font-poppins font-semibold text-dark-gray text-lg">
//                         {testimonials[currentIndex].name}
//                       </div>
//                       <div className="font-inter text-medium-gray">{testimonials[currentIndex].role}</div>
//                       <div className="font-inter text-sm text-teal">{testimonials[currentIndex].location}</div>
//                     </div>
//                   </motion.div>
//                 </div>
//               </motion.div>
//             </AnimatePresence>
//           </div>

//           {/* Navigation Buttons */}
//           <button
//             onClick={() => paginate(-1)}
//             className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-medium transition-all duration-300 group"
//           >
//             <ChevronLeft className="h-6 w-6 text-royal-purple group-hover:scale-110 transition-transform" />
//           </button>
//           <button
//             onClick={() => paginate(1)}
//             className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-medium transition-all duration-300 group"
//           >
//             <ChevronRight className="h-6 w-6 text-royal-purple group-hover:scale-110 transition-transform" />
//           </button>

//           {/* Indicators */}
//           <div className="flex justify-center gap-2 mt-8">
//             {testimonials.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => {
//                   setDirection(index > currentIndex ? 1 : -1)
//                   setCurrentIndex(index)
//                 }}
//                 className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                   index === currentIndex ? "bg-royal-purple scale-125" : "bg-royal-purple/30 hover:bg-royal-purple/50"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default TestimonialsCarousel;