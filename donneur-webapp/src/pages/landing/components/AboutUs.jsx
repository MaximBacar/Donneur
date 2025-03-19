// AboutUs.jsx
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./AboutUs.css";

// Import organization logos using URL constructor for Vite
const logoImage = new URL('../assets/card tap noback copy 2.png', import.meta.url).href;
const servImage = new URL('../assets/serv-aom.png.webp', import.meta.url).href;

const AboutUs = () => {
  const [imageError, setImageError] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const aboutStats = [
    { number: "12K+", label: "Donors" },
    { number: "28+", label: "Organizations" },
    { number: "4k+", label: "Helped" },
    { number: "5+", label: "Cities" }

  ];
  
  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  const imageVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };
  
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.5 + (i * 0.1),
        duration: 0.5
      }
    })
  };
  
  return (
    <section className="about-us" id="about" ref={ref}>
      <div className="about-bg-gradient"></div>
      <div className="container">
        <div className="about-content">
          <motion.div 
            className="about-text"
            variants={textVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <h2>Connecting Communities: From Shelters to Those in Need.</h2>
            <div className="divider">
              <span></span>
            </div>
            <p>
              Our mission is to make donations more accessible and
              encourage regular giving by providing a seamless experience for
              donors and organizations.
            </p>
            <p>
            Our platform bridges the gap between shelters, donors, and individuals in need, enabling secure and transparent cashless giving. 
            We empower communities one tap at a time.
            </p>

            <div>
      <h1>Our target numbers </h1>
    </div>
            
            <div className="about-stats">
              {aboutStats.map((stat, index) => (
                <motion.div 
                  className="stat-item" 
                  key={index}
                  custom={index}
                  variants={statVariants}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  <h3>{stat.number}</h3>
                  <span>{stat.label}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="about-button"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="about-image"
            variants={imageVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <div className="organization-logos">
              <img 
                src={logoImage} 
                alt="Dans la rue" 
                className="org-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  setImageError(true);
                }}
              />
              
            </div>
            {imageError && (
              <div className="about-image-placeholder">
                <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f7f9fa" />
                      <stop offset="100%" stopColor="#cde0fb" />
                    </linearGradient>
                  </defs>
                  <rect width="600" height="400" fill="url(#grad1)" rx="20" ry="20" />
                  <circle cx="180" cy="150" r="60" fill="#a4c5f4" />
                  <circle cx="320" cy="180" r="80" fill="#cde0fb" opacity="0.7" />
                  <circle cx="420" cy="120" r="40" fill="#a4c5f4" />
                  <text x="300" y="220" fontSize="24" fontWeight="bold" fill="#2C3E50" textAnchor="middle">Together we make a difference</text>
                </svg>
              </div>
            )}
            <div className="about-image-shape"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;