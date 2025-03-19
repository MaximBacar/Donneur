import React from "react";
import "./PartnersSection.css"; // Import the CSS file
import images from "../assets/images.png";
import asso1 from "../assets/asso1.webp";
import asso2 from "../assets/asso2.png";
import asso3 from "../assets/asso3.png";
import asso4 from "../assets/asso4.jpg";




const PartnersSection = () => {
  return (
    <div className="partners-container">
      {/* Title */}
      <h2 className="partners-title">Our Potential Partners In The Community</h2>
      <div className="title-divider"></div>


      {/* Logos */}
      <div className="partners-logos">
        <img src={images} alt="Montreal" className="partner-logo" />
        <img src={asso1} alt="Shelter 1" className="partner-logo" />
        <img src={asso2} alt="Shelter 2" className="partner-logo" />
        <img src={asso3} alt="Shelter 3" className="partner-logo" />
        <img src={asso4} alt="Shelter 4" className="partner-logo" />
      </div>
    </div>
  );
};

export default PartnersSection;
