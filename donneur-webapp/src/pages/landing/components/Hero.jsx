// Hero.jsx
import React, { useState } from "react";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import "./Hero.css";
// Import assets directly using Vite's URL constructor
const mockupDashImage = new URL('../assets/mockup dash.png', import.meta.url).href;

const Hero = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const contentVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
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

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.3,
        yoyo: Infinity
      }
    }
  };

  return (
    <section className="hero" id="home" ref={ref}>
      <div className="hero-background">
        <div className="hero-shape shape-1"></div>
        <div className="hero-shape shape-2"></div>
        <div className="hero-shape shape-3"></div>
      </div>
      <div className="container">
        <motion.div 
          className="hero-content"
          variants={contentVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Donner n'a jamais été aussi simple
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Donneur is a platform that connects donors with organizations in need.
            Making donations easier and more accessible for everyone.
          </motion.p>
          
          {/* App Store Download Buttons */}
          <div className="app-store-buttons">
            <motion.a
              href="#" 
              className="app-store-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.05,12.536l3.66,2.113c0.216,0.125,0.309,0.396,0.185,0.611C20.83,15.391,20.702,15.45,20.565,15.45H3.434 c-0.25,0-0.45-0.201-0.45-0.45c0-0.137,0.058-0.267,0.161-0.353l3.66-2.113L3.144,10.42c-0.215-0.123-0.289-0.398-0.166-0.612 c0.077-0.135,0.222-0.219,0.378-0.22h17.288c0.25,0,0.452,0.2,0.454,0.45c0,0.156-0.083,0.299-0.22,0.38L17.05,12.536z M7.2,3.15 h9.6c0.662,0,1.2,0.537,1.2,1.2v5.5H6v-5.5C6,3.687,6.537,3.15,7.2,3.15z M6,19.65v-4.15h12v4.15c0,0.662-0.537,1.2-1.2,1.2H7.2 C6.537,20.85,6,20.313,6,19.65z"/>
              </svg>
              <span>Download for iOS</span>
            </motion.a>
            <motion.a
              href="#" 
              className="app-store-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M5.2,8.2l4.224-4.224c0.111-0.111,0.111-0.292,0-0.403c-0.111-0.111-0.292-0.111-0.403,0L4.496,8.096 C4.183,8.41,4,8.828,4,9.272v5.456C4,15.172,4.183,15.59,4.496,15.904l4.525,4.525c0.111,0.111,0.292,0.111,0.403,0 c0.111-0.111,0.111-0.292,0-0.403L5.2,15.8C5.072,15.671,5,15.5,5,15.32V8.68C5,8.5,5.072,8.329,5.2,8.2z"/>
                <path d="M12,10.75c-0.689,0-1.25,0.561-1.25,1.25s0.561,1.25,1.25,1.25s1.25-0.561,1.25-1.25S12.689,10.75,12,10.75z"/>
                <path d="M18.8,8.2C18.928,8.329,19,8.5,19,8.68v6.64c0,0.18-0.072,0.351-0.2,0.48l-4.224,4.224c-0.111,0.111-0.111,0.292,0,0.403 c0.111,0.111,0.292,0.111,0.403,0l4.525-4.525C19.817,15.59,20,15.172,20,14.728V9.272c0-0.444-0.183-0.862-0.496-1.176 L14.979,3.571c-0.111-0.111-0.292-0.111-0.403,0c-0.111,0.111-0.111,0.292,0,0.403L18.8,8.2z"/>
              </svg>
              <span>Download for Android</span>
            </motion.a>
          </div>

          <div className="hero-buttons">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="features"
                spy={true}
                smooth={true}
                offset={-70}
                duration={800}
                className="btn btn-outline"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div 
          className="hero-image"
          variants={imageVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <img 
            src={mockupDashImage} 
            alt="Donneur App Dashboard" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "../assets/placeholder.png";
            }}
          />
        </motion.div>
      </div>
      <div className="scroll-down-indicator">
        <Link 
          to="features" 
          spy={true} 
          smooth={true} 
          offset={-70} 
          duration={800}
        >
          <motion.div
            animate={{ 
              y: [0, 10, 0],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "loop"
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2C3E50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </Link>
      </div>
    </section>
  );
};

export default Hero;