import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donation from './pages/donation/donation'
import "./index.css"
import ChangePassword from './pages/password/changePassword';
import LandingPage from './pages/landing/LandingPage';

const hostname = window.location.hostname;
const isGiveDomain = hostname === "give.donneur.ca";

console.log("App initializing, hostname:", hostname, "isGiveDomain:", isGiveDomain);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        {isGiveDomain && <Route path="/:id" element={<Donation />} />}
        {!isGiveDomain && (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/setPassword" element={<ChangePassword />} />
          </>
        )}
      </Routes>
    </Router>
  </StrictMode>,
)
