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
const isDevelopment = hostname === "localhost" || hostname === "127.0.0.1";

console.log("Hostname:", hostname);
console.log("Is Give Domain:", isGiveDomain);
console.log("Is Development:", isDevelopment);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* Show donation route on give.donneur.ca OR for all routes starting with /donation in development */}
        {isGiveDomain || (isDevelopment && (window.location.pathname.startsWith('/donation') || window.location.pathname.startsWith('/thank-you'))) ? (
          <>
            {/* For production give.donneur.ca */}
            {isGiveDomain && (
              <>
                <Route path="/:id" element={<Donation />} />
                <Route path="/thank-you" element={<ThankYou />} />
              </>
            )}
            
            {/* For local development */}
            {isDevelopment && (
              <>
                <Route path="/donation/:id" element={<Donation />} />
                <Route path="/thank-you" element={<ThankYou />} />
              </>
            )}
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