// Features.jsx
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Features.css';

// Import assets using URL constructor for Vite
const cardTapImage = new URL('../assets/card tap noback copy.png', import.meta.url).href;
const contactlessImage = new URL('../assets/contactless copy.png', import.meta.url).href;
const webContentImage = new URL('../assets/web-content.png', import.meta.url).href;
const messageImage = new URL('../assets/message.png', import.meta.url).href;
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
      icon: cardTapImage,
      title: 'Effortless Donations',
      description: 'Make a donation in just a few clicks and support causes you care about.',
      color: '#FFD166'
    },
    {
      id: 2,
      icon: webContentImage,
      title: 'Every Shelter Dashboard',
      description: 'A single unified dashboard for all shelters to manage their resources and donations.',
      color: '#06D6A0'
    },
    {
      id: 3,
      icon: mapImage,
      title: 'Interactive Map',
      description: 'Discover nearby shelters and donation points with our interactive geolocation map.',
      color: '#118AB2'
    },
    {
      id: 4,
      icon: feedImage,
      title: 'Creative Feed',
      description: 'Stay updated with inspiring stories and see the impact of donations in real-time.',
      color: '#EF476F'
    },
    {
      id: 5,
      icon: offlineImage,
      title: 'Offline Transactions',
      description: 'Continue making donations even without internet connection with our offline mode.',
      color: '#073B4C'
    },
    {
      id: 6,
      icon: chatImage,
      title: 'Direct Messaging',
      description: 'Connect directly with organizations through our secure in-app messaging system.',
      color: '#9B5DE5'
    },
    {
      id: 7,
      icon: contactlessImage,
      title: 'Impact Tracking',
      description: 'See exactly how your donations are making a difference in the community.',
      color: '#F15BB5'
    },
    {
      id: 8,
      icon: messageImage,
      title: 'Smart Notifications',
      description: 'Receive timely, personalized updates about campaigns and opportunities.',
      color: '#00BBF9'
    },
    {
      id: 9,
      icon: supportImage,
      title: 'Accessible Design',
      description: 'Inclusive experience designed for users of all abilities across any device.',
      color: '#FB8B24'
    },
    {
      id: 10,
      icon: securityImage,
      title: 'Secure Transactions',
      description: 'Bank-level encryption and security protocols to protect your information.',
      color: '#4361EE'
    }
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
          >Our Features</motion.h2>
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
          >Empowering sustainable donations through state-of-the-art technology</motion.p>
        </motion.div>
        
        <div className="features-highlight" ref={carouselRef}>
          <motion.h3 
            className="section-subheader"
            variants={fadeInUpVariants}
            initial="hidden"
            animate={highlightControls}
          >
            Key Features
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
                  boxShadow: '0 20px 30px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: `linear-gradient(135deg, white 0%, white 80%, ${feature.color}20 100%)`,
                  borderTop: `4px solid ${feature.color}`
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
              <div className="feature-icon-wrapper" style={{ background: `${feature.color}15` }}>
                <motion.img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="feature-icon" 
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
          <h3>Ready to experience these features?</h3>
          <motion.button 
            className="cta-button"
            whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;