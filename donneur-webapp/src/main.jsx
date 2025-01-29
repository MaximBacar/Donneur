import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Donation from './pages/donation/donation'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Donation />
  </StrictMode>,
)
