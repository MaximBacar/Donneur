import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Donnation from './pages/donation/donation'
import "./index.css"



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/:id" element={<Donnation />} />
      </Routes>
    </Router>
  </StrictMode>,
)
