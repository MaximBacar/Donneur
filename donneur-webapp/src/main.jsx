import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donation from './pages/donation/donation'
import "./index.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/:id" element={<Donation />} />
      </Routes>
    </Router>
  </StrictMode>,
)
