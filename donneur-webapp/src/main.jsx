import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donation from './pages/donation/donation'
import "./index.css"
import ChangePassword from './pages/password/changePassword';

const hostname = window.location.hostname;
const isGiveDomain = hostname === "give.donneur.ca";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/:id" element={<Donation />} />
        {isGiveDomain ? (
          <Route path="/:id" element={<Donation />} />
        ) : (
          <>
            <Route path="/setPassword" element={<ChangePassword />} />
          </>
        )}
      </Routes>
    </Router>
  </StrictMode>,
)
