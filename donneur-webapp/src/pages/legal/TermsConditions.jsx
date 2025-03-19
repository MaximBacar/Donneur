import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-conditions-container" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" style={{
          display: 'inline-block',
          marginBottom: '20px',
          color: '#3498db',
          textDecoration: 'none'
        }}>← Back to Home</Link>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#2c3e50' }}>Terms & Conditions</h1>
      
      <div style={{ marginBottom: '30px', color: '#7f8c8d', fontSize: '16px' }}>
        <p>Last Updated: 16th March 2025</p>
      </div>

      <p style={{ marginBottom: '30px' }}>
        Welcome to Donneur and Donneur.ca. These Terms and Conditions govern your access and use of our services, including the App, Website, and any related features (collectively, the "Services"). By using our Services, you agree to these Terms. If you do not agree, please refrain from using our Services.
      </p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Donneur and Donneur.ca, you acknowledge that you have read, understood, and agree to be bound by these Terms.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>2. Description of Services</h2>
        <p>
          Donneur is a platform that facilitates cashless donations to street mendicants through secure transactions, NFC-enabled card systems, and other related services. Users may include donors, recipients, and organizations managing donations.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>3. User Accounts</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>To access certain features, you may need to create an account.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You must provide accurate, complete, and current information.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>4. Donations and Transactions</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Donations are voluntary and non-refundable unless stated otherwise.</li>
          <li>We do not guarantee how recipients will use the donated funds.</li>
          <li>Transactions may be subject to processing fees as displayed during the payment process.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>5. User Conduct</h2>
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Use the Services for any illegal or unauthorized purposes.</li>
          <li>Misrepresent your identity or affiliation with any entity.</li>
          <li>Interfere with the operation of the Services, including hacking or introducing malicious code.</li>
          <li>Collect or store personal data of other users without consent.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>6. Intellectual Property</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>All content, trademarks, and materials available on Donneur and Donneur.ca are the property of Donneur and its licensors.</li>
          <li>You may not copy, distribute, or use our content without written permission.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>7. Limitation of Liability</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>We provide our Services "as is" without warranties of any kind.</li>
          <li>We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Services.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>8. Third-Party Links and Services</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Our Services may contain links to third-party websites or services.</li>
          <li>We do not endorse or assume responsibility for third-party content or privacy practices.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>9. Modifications to Terms</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>We reserve the right to update these Terms at any time.</li>
          <li>Continued use of the Services after changes means you accept the revised Terms.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>10. Termination</h2>
        <p>
          We may suspend or terminate your access to the Services at any time for violations of these Terms or other reasons at our discretion.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Quebec.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>12. Contact Information</h2>
        <p>
          For any questions about these Terms, please contact us.
        </p>
      </section>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eaeaea', paddingTop: '20px', color: '#7f8c8d', fontSize: '14px' }}>
        <p>Last Updated: 16th March 2025</p>
      </div>
    </div>
  );
};

export default TermsConditions;