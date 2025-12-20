import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Thesis from './Thesis.tsx'
import Paper from './Paper.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/thesis" element={<Thesis />} />
        <Route path="/paper" element={<Paper />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
