import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import './Header.css';
import logoapp from "../assets/logoapp.png";


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <img src={logoapp} alt="Donneur Logo" className="our-logo" />
        </div>
        
        <div className={`mobile-menu-button ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <Link 
                to="features" 
                spy={true} 
                smooth={true} 
                offset={-70} 
                duration={800}
                onClick={closeMenu}
                className="nav-link"
              >
                Feature List
              </Link>
            </li>
            <li>
              <Link 
                to="about" 
                spy={true} 
                smooth={true} 
                offset={-70} 
                duration={800}
                onClick={closeMenu}
                className="nav-link"
              >
                About Donneur
              </Link>
            </li>
            <li>
              <Link 
                to="partners-container" 
                spy={true} 
                smooth={true} 
                offset={-70} 
                duration={800}
                onClick={closeMenu}
                className="nav-link"
              >
                Preview
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;