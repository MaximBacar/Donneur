// Features.jsx
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Features.css';

// Import assets using URL constructor for Vite
const map = new URL('../assets/map.png', import.meta.url).href;
const feed = new URL('../assets/feed.png', import.meta.url).href;
const message = new URL('../assets/message.png', import.meta.url).href;
const nowifi = new URL('../assets/nowifi.png', import.meta.url).href;
const supportImage = new URL('../assets/support.png', import.meta.url).href;
const securityImage = new URL('../assets/cyber-security copy.png', import.meta.url).href;

// We'll assume you have these new images in your assets folder
// If not, please add appropriate images for these features
const mapImage = new URL('../assets/map.png', import.meta.url).href;
const feedImage = new URL('../assets/feed.png', import.meta.url).href;
const offlineImage = new URL('../assets/offline.png', import.meta.url).href;
const chatImage = new URL('../assets/chat.png', import.meta.url).href;

const Features = () => {
  // Multiple refs for different sections with different animation triggers
  const [headerRef, headerInView] = useInView({
    triggerOnce: false,
    threshold: 0.2
  });
  
  const [gridRef, gridInView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });

  const [carouselRef, carouselInView] = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  
  // Animation controls
  const headerControls = useAnimation();
  const gridControls = useAnimation();
  const highlightControls = useAnimation();
  
  useEffect(() => {
    if (headerInView) {
      headerControls.start('visible');
    } else {
      headerControls.start('hidden');
    }
  }, [headerControls, headerInView]);
  
  useEffect(() => {
    if (gridInView) {
      gridControls.start('visible');
    } else {
      gridControls.start('hidden');
    }
  }, [gridControls, gridInView]);

  useEffect(() => {
    if (carouselInView) {
      highlightControls.start('visible');
    } else {
      highlightControls.start('hidden');
    }
  }, [highlightControls, carouselInView]);

  const featuresList = [
    {
      id: 1,
      icon: feed,
      title: 'Creative Feed',
      description: 'A live feed where shelters and individuals can post urgent needs, updates, and success stories—keeping donors informed and engaged in real time.',
      color: '#fdc444'
    },
    {
      id: 2,
      icon: map,
      title: 'Interactive map',
      description: 'Locate nearby shelters, donation points, and areas where help is needed, making it easier to give and support your community.',
      color: '#fdc444'
    },
    {
      id: 3,
      icon: nowifi,
      title: 'Offline transactions',
      description: 'Donations and transactions are saved when offline and automatically processed once a connection is available, ensuring uninterrupted giving.',
      color: '#fdc444'
    },
    {
      id: 4,
      icon: message,
      title: 'Direct Messaging',
      description: 'Donors, shelters, and individuals can communicate instantly, allowing for personalized support, coordination, and real-tim assistance.',
      color: '#fdc444'
    },

  ];

  // Key features highlighted separately
  const keyFeatures = featuresList.slice(0, 4);
  const additionalFeatures = featuresList.slice(4);

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  };

  const highlightVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="features" id="features">
      <div className="features-bg-shape"></div>
      <div className="features-particles"></div>
      <div className="container">
        <motion.div 
          className="section-header"
          ref={headerRef}
          variants={headerVariants}
          initial="hidden"
          animate={headerControls}
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >Key Features</motion.h2>
          <div className="divider">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: '80px' }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            ></motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
          >Our platform bridges the gap between shelters, donors, and individuals in need, enabling secure and transparent cashless giving. 
          We empower communities one tap at a time.</motion.p>
        </motion.div>
        
        <div className="features-highlight" ref={carouselRef}>
          <motion.h3 
            className="section-subheader"
            variants={fadeInUpVariants}
            initial="hidden"
            animate={highlightControls}
          >
          </motion.h3>
          <motion.div 
            className="highlight-cards"
            variants={highlightVariants}
            initial="hidden"
            animate={highlightControls}
          >
            {keyFeatures.map((feature, index) => (
              <motion.div 
                className="highlight-card"
                key={feature.id}
                custom={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 20px 30px rgba(162, 226, 144, 0)'
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: `linear-gradient(135deg, white 0%, white 95%,#a2e290`,
                  borderTop: `3px solid ${feature.color}`
                }}
              >
                <div className="highlight-icon-wrapper" style={{ background: `${feature.color}15` }}>
                  <img src={feature.icon} alt={feature.title} className="highlight-icon" />
                  <div className="highlight-icon-bg" style={{ background: feature.color }}></div>
                </div>
                <motion.h3
                  whileHover={{ color: feature.color }}
                  transition={{ duration: 0.3 }}
                >{feature.title}</motion.h3>
                <p>{feature.description}</p>
                <motion.div 
                  className="feature-hover-effect"
                  style={{ background: `${feature.color}10` }}
                ></motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="features-grid"
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={gridControls}
        >
          {additionalFeatures.map((feature, index) => (
            <motion.div 
              className="feature-card" 
              key={feature.id}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
              style={{
                borderLeft: `3px solid ${feature.color}`
              }}
              transition={{
                delay: index * 0.1
              }}
            >
              <div className="feature-icon-wrapper" style={{ background: tranparent }}>
                <motion.img 
                  src={feature.icon} 
                  alt={feature.title} 
                  /*className="feature-icon" */
                  whileHover={{ rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <motion.div 
                className="feature-hover-effect"
                style={{ background: `${feature.color}10` }}
                whileHover={{ scale: 1.5 }}
              ></motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="features-cta"
          variants={fadeInUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <h3>Ready to join our community?</h3>
          <motion.button 
            className="cta-button"
            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Join Us Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;