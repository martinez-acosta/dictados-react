import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard.jsx'
import DictadosMelodicos from './components/DictadosMelodicos.jsx'
import EjerciciosIntervalos from './components/EjerciciosIntervalos.tsx'
import IntervalosPiano from './components/IntervalosPiano'
import BajoTrainer from './components/BajoTrainer.tsx'
import VocalTrainer from './components/VocalTrainer.tsx'
import TriadTrainer from './components/TriadTrainer.tsx'
import IntervalsTrainer from './components/IntervalsTrainer.tsx'
import RitmicaTrainer from './components/RitmicaTrainer.tsx'
import RitmicaConAlturas from './components/RitmicaConAlturas.tsx'
import LecturaMusical from './components/LecturaMusical.tsx'
import TunerPage from './components/TunerPage.tsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/dictados-react">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/afinador" element={<TunerPage />} />
        <Route path="/dictados" element={<DictadosMelodicos />} />
        <Route path="/intervalos" element={<EjerciciosIntervalos />} />
        <Route path="/bajo" element={<BajoTrainer />} />
        <Route path="/vocal" element={<VocalTrainer />} />
        <Route path="/triadas" element={<TriadTrainer />} />
        <Route path="/intervalos-trainer" element={<IntervalsTrainer />} />
        <Route path="/ritmica" element={<RitmicaTrainer />} />
        <Route path="/ritmica-alturas" element={<RitmicaConAlturas />} />
        <Route path="/intervalos-piano" element={<IntervalosPiano/>} />
        <Route path="/lectura-musical" element={<LecturaMusical />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

