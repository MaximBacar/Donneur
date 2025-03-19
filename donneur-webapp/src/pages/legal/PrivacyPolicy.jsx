import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="privacy-policy-container" style={{
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

      <h1 style={{ fontSize: '32px', marginBottom: '30px', color: '#2c3e50' }}>Privacy Policy for Donneur and Donneur.ca</h1>
      
      <div style={{ marginBottom: '30px', color: '#7f8c8d', fontSize: '16px' }}>
        <p>Effective Date: 15th March 2025</p>
        <p>Last Updated: 16th March 2025</p>
      </div>

      <p style={{ marginBottom: '30px' }}>
        Welcome to Donneur and Donneur.ca. We are committed to protecting your privacy and ensuring that your personal data is handled securely and transparently. This Privacy Policy explains how we collect, use, disclose, and protect your information.
      </p>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />
      
      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>1. Information We Collect</h2>
        <p>We collect different types of information, including:</p>
        
        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>1.1 Personal Information</h3>
        <p>When you sign up, we may collect:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Name</li>
          <li>Email address</li>
          <li>Profile information</li>
        </ul>

        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>1.2 Usage Data</h3>
        <p>We collect information about how you use our App and Website, including:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Pages visited, buttons clicked, and session duration</li>
          <li>Login timestamps and actions performed</li>
          <li>Device information (such as IP address, browser type, operating system)</li>
        </ul>

        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>1.3 Cookies and Tracking Technologies</h3>
        <p>We use cookies and similar tracking technologies to enhance your experience and analyze usage. You can manage cookie preferences in your browser settings.</p>

        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>1.4 Payment Information</h3>
        <p>If you purchase services through our App or Website, we may collect payment details such as:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Billing address</li>
          <li>Transaction history</li>
        </ul>
        <p><em>Note: Payments are securely processed through third-party payment gateways. We do not store credit card details.</em></p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>2. How We Use Your Information</h2>
        <p>We use the collected data to:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Provide, operate, and improve our App and Website</li>
          <li>Personalize user experiences</li>
          <li>Send email notifications, including account verification and security updates</li>
          <li>Respond to inquiries and provide customer support</li>
          <li>Process payments (if applicable)</li>
          <li>Detect and prevent fraudulent activities</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>3. How We Share Your Information</h2>
        <p>We do not sell or rent your personal data. However, we may share data with:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li><strong>Service Providers:</strong> Third-party vendors who help us with hosting, analytics, email delivery, and payments.</li>
          <li><strong>Legal Authorities:</strong> If required by law, we may disclose your data to comply with legal obligations, enforce terms, or protect user safety.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>4. Third-Party Services</h2>
        <p>
          Our App and Website may contain links to third-party websites or services. These services have their own privacy policies, and we do not control their data practices. We recommend reviewing their policies before providing personal data.
        </p>
        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>Third-Party Services We Use</h3>
        <p>We integrate with third-party tools like:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Firebase Authentication (for user login and verification)</li>
          <li>Google Analytics (for tracking user activity)</li>
          <li>Payment Processors (e.g., Stripe, PayPal)</li>
        </ul>
        <p>These services may collect data independently.</p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>5. Data Retention and Security</h2>
        
        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>5.1 Data Retention</h3>
        <p>We retain your data only as long as necessary for business purposes or legal compliance. You may request data deletion at any time.</p>
        
        <h3 style={{ fontSize: '20px', marginTop: '20px', marginBottom: '10px', color: '#2c3e50' }}>5.2 Security Measures</h3>
        <p>We implement strict security measures, including:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li>Encrypted data transmission (SSL/TLS)</li>
          <li>Secure authentication methods (e.g., Firebase Authentication)</li>
          <li>Limited access to personal data within our organization</li>
        </ul>
        <p>However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>6. Your Rights and Choices</h2>
        <p>Depending on your location, you may have the following rights:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '15px' }}>
          <li><strong>Access Your Data:</strong> Request a copy of the personal data we hold about you.</li>
          <li><strong>Correct Your Data:</strong> Update or correct inaccuracies in your personal data.</li>
          <li><strong>Delete Your Data:</strong> Request deletion of your personal information.</li>
          <li><strong>Opt-Out of Marketing:</strong> Unsubscribe from promotional emails.</li>
          <li><strong>Restrict Data Processing:</strong> Limit how we process your data in certain circumstances.</li>
        </ul>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>7. Children's Privacy</h2>
        <p>
          Our App and Website are not intended for children under 13 (or the applicable age in your region). We do not knowingly collect personal data from children. If you believe a child has provided us with data, please contact us for deletion.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>8. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If changes are significant, we will notify users via email or an in-app message. Please review this policy periodically.
        </p>
      </section>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eaeaea' }} />

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#2c3e50' }}>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, you can contact us.
        </p>
      </section>

      <div style={{ marginTop: '40px', borderTop: '1px solid #eaeaea', paddingTop: '20px', color: '#7f8c8d', fontSize: '14px' }}>
        <p>Last Updated: 16th March 2025</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;