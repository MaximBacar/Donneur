// Features.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import './Features.css';

// Import assets using URL constructor for Vite
const cardTapImage = new URL('../assets/card tap noback copy.png', import.meta.url).href;
const contactlessImage = new URL('../assets/contactless copy.png', import.meta.url).href;
const webContentImage = new URL('../assets/web-content.png', import.meta.url).href;
const messageImage = new URL('../assets/message.png', import.meta.url).href;
const supportImage = new URL('../assets/support.png', import.meta.url).href;
const securityImage = new URL('../assets/cyber-security copy.png', import.meta.url).href;

const Features = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const featuresList = [
    {
      id: 1,
      icon: cardTapImage,
      title: 'Easy Donations',
      description: 'Make a donation in just a few clicks and support causes you care about.'
    },
    {
      id: 2,
      icon: webContentImage,
      title: 'Find Organizations',
      description: 'Discover and connect with organizations that align with your values and mission.'
    },
    {
      id: 3,
      icon: contactlessImage,
      title: 'Track Impact',
      description: 'See exactly how your donations are making a difference in the community.'
    },
    {
      id: 4,
      icon: messageImage,
      title: 'Get Notifications',
      description: 'Receive timely updates about campaigns and opportunities that matter to you.'
    },
    {
      id: 5,
      icon: supportImage,
      title: 'Mobile Friendly',
      description: 'Access your account and make donations from any device, anywhere.'
    },
    {
      id: 6,
      icon: securityImage,
      title: 'Secure Transactions',
      description: 'Rest easy knowing all your information and transactions are fully protected.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section className="features" id="features" ref={ref}>
      <div className="features-bg-shape"></div>
      <div className="container">
        <motion.div 
          className="section-header"
          variants={headerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <h2>Our Features</h2>
          <div className="divider">
            <span></span>
          </div>
          <p>Everything you need to make giving back a regular habit</p>
        </motion.div>
        
        <motion.div 
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {featuresList.map(feature => (
            <motion.div 
              className="feature-card" 
              key={feature.id}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="feature-icon-wrapper">
                <img src={feature.icon} alt={feature.title} className="feature-icon" style={{ width: '40px', height: '40px' }} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-hover-effect"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;