import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import './landing.css';

const LandingPage = () => {
  // Create a simple placeholder for missing images
  const placeholderImage = (id, text = "Placeholder") => (
    <div
      id={id}
      style={{
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        padding: '20px',
        borderRadius: '8px',
        width: '100%',
        height: '100%',
        minHeight: '100px'
      }}
    >
      {text}
    </div>
  );

  // Make the images available in global scope for components to use
  React.useEffect(() => {
    // Injecting global placeholder function for missing images
    window.placeholderImage = placeholderImage;
    
    // Mock the images that might be missing
    if (!document.querySelector("#logo-placeholder")) {
      const logoImg = document.createElement('div');
      logoImg.id = "logo-placeholder";
      logoImg.innerHTML = `<h1 style="font-weight: bold; color: #2C3E50;">DONNEUR</h1>`;
      logoImg.style.display = "none";
      document.body.appendChild(logoImg);
    }

    return () => {
      // Cleanup
      const logoPlaceholder = document.querySelector("#logo-placeholder");
      if (logoPlaceholder) logoPlaceholder.remove();
      delete window.placeholderImage;
    };
  }, []);

  return (
    <div className="landing-page">
      <Header />
      <Hero />
      <Features />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default LandingPage;
