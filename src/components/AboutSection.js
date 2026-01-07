"use client";
import { useEffect } from "react";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Users, BookOpen, Globe, Heart, Lightbulb, Target, Star, Sparkles } from "lucide-react";
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

  const visionItems = [
    {
      icon: Users,
      text: "To inspire African emerging leaders for impact driven leadership, high ethics, moral values and integrity.",
    },
    {
      icon: BookOpen,
      text: "To raise transformational leaders, entrepreneurs and new captains of industries who are keen to transparency, accountability and patriotism. Ensuring equity, justice and fairness",
    },
    { icon: Globe, text: "To always project and protect the good image of Africa worldwide" },
    {
      icon: Star,
      text: "To raise Ambassadors for global peace to fight insecurity, terrorism and social instability",
    },
    { icon: Lightbulb, text: "To groom African youths to become creators and innovators of goods and services not only influencers" },
    {
      icon: Target,
      text: "To fight political a-party: encourage young Africans to participate in politics, run for office, protect and vote during and after election.",
    },
    { icon: Sparkles, text: "To influence government policies to transform the youths dreams and vision into realities by advocacy" },
    {
      icon: Heart,
      text: "To build a continent where every young African’s are intentional in making impact locally and also thriving globally",
    },
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
            {/* <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-poppins font-bold text-royal-purple mb-6"
            >
              MISSION & VISION
            </motion.h2> */}

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-2xl font-poppins font-semibold text-royal-purple mb-3"
            >
              MISSION STATEMENT:
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg font-inter text-medium-gray leading-relaxed mb-6"
            >
              To inspire guide and equip African youths with the right
              knowledge, skills, ethics and moral values required to discover
              their full potentials, develop their skills and talents to
              become valuable in the global market being the best version of
              themselves. We aim at creating opportunities for mentorship,
              education and leadership that nurture responsible citizens and
              visionary leaders who will drive sustainable economic, social and
              political development across the continent and beyond.
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="text-2xl font-poppins font-semibold text-royal-purple mb-3"
            >
              VISION STATEMENT:
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg font-inter text-medium-gray leading-relaxed mb-6"
            >
              To build a continent where every young African has access to
              education, mentorship and empowerment, enabling them to rise as
              confident leaders, peace advocates, innovators and change makers
              who contribute to the sustainable development of Africa and also
              thrive globally.
            </motion.p>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-2xl font-poppins font-semibold text-royal-purple mb-4"
            >
              OUR VISION
            </motion.h3>

            <div className="space-y-4 mb-8">
              {visionItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
                  }
                  transition={{ duration: 0.6, delay: 1.1 + index * 0.08 }}
                  whileHover={{ x: 8, transition: { duration: 0.25 } }}
                  className="flex items-start gap-3"
                >
                  <motion.div
                        animate={{
                          scale: [1, 1.12, 1],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 5 + index * 0.2,
                          ease: "easeInOut",
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {/** render the icon for this item */}
                        {(() => {
                          const Icon = item.icon;
                          return <Icon className="h-6 w-6 text-teal" />;
                        })()}
                      </motion.div>
                      <span className="font-inter text-dark-gray">
                        <span className="font-semibold text-dark-gray mr-2">{index + 1}.</span>
                        {item.text}
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
