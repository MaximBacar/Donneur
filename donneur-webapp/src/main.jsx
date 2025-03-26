import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donation from './pages/donation/donation'
import ThankYou from './pages/donation/ThankYou'
import "./index.css"
import ChangePassword from './pages/password/changePassword';
import LandingPage from './pages/landing/LandingPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';

const hostname = window.location.hostname;
const isGiveDomain = hostname === "give.donneur.ca";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {isGiveDomain ? (
          <>
            <Route path="/:id" element={<Donation />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setPassword" element={<ChangePassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </>
        )}
      </Routes>
    </Router>
  </StrictMode>,
)