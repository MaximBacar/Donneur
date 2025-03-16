// Header.jsx
import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link, animateScroll as scroll } from "react-scroll";
import { motion } from "framer-motion";
import "./Header.css";
// Import logo directly using Vite's URL constructor
const logoImage = new URL('../assets/logo.png', import.meta.url).href;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollToTop = () => {
    scroll.scrollToTop();
  };

  return (
    <motion.header 
      className={`header ${scrolled ? "header-scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container">
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RouterLink to="/" onClick={scrollToTop}>
            <img 
              src={logoImage} 
              alt="Donneur" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "../assets/placeholder.png";
                e.target.style.display = "none";
                const logoText = document.createElement("h1");
                logoText.style.fontWeight = "bold";
                logoText.style.fontSize = "24px";
                logoText.style.color = "#2C3E50";
                logoText.innerText = "DONNEUR";
                e.target.parentNode.appendChild(logoText);
              }} 
            />
          </RouterLink>
        </motion.div>
        <nav className={`nav ${menuOpen ? "nav--open" : ""}`}>
          <button className="nav-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className="nav-list">
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="home"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="about"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="features"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
            </motion.li>
            <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="contact"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
            </motion.li>
          </ul>
        </nav>
        <motion.div 
          className="header-buttons"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="app-store-buttons">
            <motion.a
              href="#" 
              className="app-store-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Download App</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;