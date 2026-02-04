"use client";
import { useEffect } from "react";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Users, BookOpen, Globe, Heart, Lightbulb, Target, Star, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Image4 from "../Images/MOA4.jpg";
import Image5 from "../Images/MOA5.jpg";
import Image6 from "../Images/MOA6.jpg";
import Image8 from "../Images/MOA8.jpg";
import Image9 from "../Images/MOA9.jpg";
import Image10 from "../Images/MOA10.jpg";
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
    { src: Image4, alt: "Mentorship" },
    { src: Image5, alt: "Mentorship" },
    { src: Image6, alt: "Mentorship" },
    { src: Image8, alt: "Mentorship" },
    { src: Image9, alt: "Mentorship" },
    { src: Image10, alt: "Mentorship" },
    { src: Image12, alt: "Mentorship" },
    { src: Image13, alt: "Mentorship" },
    { src: Image14, alt: "Mentorship" },
  ];

  const metrics = [
    { value: "500+", label: "Lives Touched" },
    // { value: "50+", label: "Mentors Active" },
    // { value: "10+", label: "Countries Reached" },
    { value: "100%", label: "Community Focused" }
  ];

  return (
    <section id="about" style={{ scrollMarginTop: '5rem' }} className="py-20 bg-teal/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-royal-purple font-semibold tracking-wider uppercase text-sm mb-3 block">
            WHO WE ARE
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-dark-navy mb-6 leading-tight">
            Empowering Africa's Future Leaders
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            {/* Mission Statement */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-royal-purple/10 rounded-lg">
                  <Target className="w-6 h-6 text-royal-purple" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-royal-purple">
                  MISSION STATEMENT:
                </h3>
              </div>
              <p className="text-lg font-sans text-medium-gray leading-relaxed pl-2 border-l-4 border-royal-purple/20">
                To inspire guide and equip African youths with the right
                knowledge, skills, ethics and moral values required to discover
                their full potentials, develop their skills and talents to
                become valuable in the global market being the best version of
                themselves. We aim at creating opportunities for mentorship,
                education and leadership that nurture responsible citizens and
                visionary leaders who will drive sustainable economic, social and
                political development across the continent and beyond.
              </p>
            </div>

            {/* Vision Statement */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal/10 rounded-lg">
                  <Globe className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-royal-purple">
                  VISION STATEMENT:
                </h3>
              </div>
              <p className="text-lg font-sans text-medium-gray leading-relaxed pl-2 border-l-4 border-teal/20">
                To build a continent where every young African has access to
                education, mentorship and empowerment, enabling them to rise as
                confident leaders, peace advocates, innovators and change makers
                who contribute to the sustainable development of Africa and also
                thrive globally.
              </p>
            </div>

            {/* Our Vision List */}
            <div>
              <h3 className="text-2xl font-heading font-semibold text-royal-purple mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-bright-orange" />
                OUR VISION
              </h3>
              <div className="space-y-4">
                {visionItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-50"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {(() => {
                        const Icon = item.icon;
                        return <Icon className="h-5 w-5 text-teal" />;
                      })()}
                    </div>
                    <span className="font-sans text-dark-gray text-sm md:text-base">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Image Carousel & Metrics */}
          <div className="lg:sticky lg:top-24 space-y-12">

            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-[4/3] lg:aspect-[3/4]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <img
                      src={aboutImages[currentImageIndex].src || "/placeholder.svg"}
                      alt={aboutImages[currentImageIndex].alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute bottom-6 right-6 z-20 flex gap-3">
                  <button
                    onClick={prevImage}
                    className="p-4 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-royal-purple rounded-full transition-all duration-300 active:scale-95 touch-manipulation"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="p-4 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-royal-purple rounded-full transition-all duration-300 active:scale-95 touch-manipulation"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Decorative elements behind image */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full border-2 border-dashed border-teal/30 rounded-3xl hidden lg:block" />
              <div className="absolute -z-10 -bottom-10 -left-10 w-full h-full border-2 border-dashed border-royal-purple/30 rounded-3xl hidden lg:block" />
            </motion.div>

            {/* Impact Metrics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-royal-purple rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Globe className="w-32 h-32" />
              </div>

              <h3 className="text-xl font-heading font-bold mb-6 relative z-10 border-b border-white/20 pb-4">
                Our Impact
              </h3>

              <div className="grid grid-cols-2 gap-6 relative z-10">
                {metrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="text-3xl md:text-4xl font-heading font-bold text-bright-orange mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm font-sans text-gray-200">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
