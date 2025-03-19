import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donation from './pages/donation/donation'
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
        {console.log(isGiveDomain)}
        {isGiveDomain ? (
          <Route path="/:id" element={<Donation />} />
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setPassword" element={<ChangePassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
          </>
          
        )}
      </Routes>
    </Router>
  </StrictMode>,
)
