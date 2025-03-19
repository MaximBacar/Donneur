import React, { useState, useEffect } from 'react';
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

  return (
    <header className={`header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
                  <img src={logoapp} alt="Montreal" className="our-logo" />
        </div>
        
        <div className={`mobile-menu-button ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/feature-list">Feature List</a></li>
            <li><a href="/about-donneur">About Donneur</a></li>
            <li><a href="/preview">Preview</a></li>
          </ul>
        </nav>
        
        <div className="cta-button">
          <a href="/donate" className="donate-button">DONATE</a>
        </div>
      </div>
    </header>
  );
};

export default Header;