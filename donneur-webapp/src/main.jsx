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
const isDevelopment = hostname === "localhost" || hostname === "127.0.0.1";

console.log("Hostname:", hostname);
console.log("Is Give Domain:", isGiveDomain);
console.log("Is Development:", isDevelopment);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Show donation route on give.donneur.ca OR for all routes starting with /donation in development */}
        {isGiveDomain || (isDevelopment && window.location.pathname.startsWith('/donation')) ? (
          <>
            {/* For production give.donneur.ca */}
            {isGiveDomain && <Route path="/:id" element={<Donation />} />}
            
            {/* For local development */}
            {isDevelopment && <Route path="/donation/:id" element={<Donation />} />}
          </>
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