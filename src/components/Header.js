"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../Images/logo.jpg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Objectives", href: "#programs" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-medium"
          : "bg-white shadow-soft"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center cursor-pointer"
          >
            <motion.div
              animate={{
                color: ["#6D28D9", "#6D28D9", "#6D28D9"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-2xl font-poppins font-bold"
            >
              <img
                src={logo}
                alt="MOA only logo"
                class="h-12 w-auto md:h-12 lg:h-12 object-contain"
              />
            </motion.div>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{
                  scale: 1.05,
                  color: "#6D28D9",
                  transition: { duration: 0.2 },
                }}
                className="font-poppins font-medium text-dark-gray hover:text-royal-purple px-4 py-2 rounded-md hover:bg-royal-purple/10 transition-all duration-300"
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ rotate: 360 }}
            >
              <button className="hidden md:flex p-2 hover:bg-gray-100 rounded-md">
                <Search className="h-5 w-5 text-dark-gray" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="hidden md:flex gradient-orange text-white font-poppins font-semibold px-6 py-3 rounded-full shadow-soft">
                Join Community
              </button>
            </motion.div> */}

            <motion.div whileTap={{ scale: 0.9 }}>
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-dark-gray" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6 text-dark-gray" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 border-t border-light-gray overflow-hidden"
            >
              <nav className="flex flex-col space-y-2">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ x: 10 }}
                    className="font-poppins font-medium text-dark-gray hover:text-royal-purple px-4 py-3 rounded-md hover:bg-royal-purple/10 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </motion.a>
                ))}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="pt-4 px-4"
                >
                  <button className="w-full gradient-orange text-white font-poppins font-semibold py-3 rounded-full">
                    Join Community
                  </button>
                </motion.div> */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
