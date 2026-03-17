import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
import DictadosMelodicos from "./components/DictadosMelodicos.jsx";
import DictadosGranPentagrama from "./components/DictadosGranPentagrama.jsx";
import EjerciciosIntervalos from "./components/EjerciciosIntervalos.tsx";
import IntervalosPiano from "./components/IntervalosPiano";
import BajoTrainer from "./components/BajoTrainer.tsx";
import BassScaleSuite from "./components/BassScaleSuite.tsx";
import BassCircleOfFifthsPage from "./components/BassCircleOfFifthsPage.tsx";
import VocalTrainer from "./components/VocalTrainer.tsx";
import TriadTrainer from "./components/TriadTrainer.tsx";
import IntervalsTrainer from "./components/IntervalsTrainer.tsx";
import RitmicaTrainer from "./components/RitmicaTrainer.tsx";
import RitmicaConAlturas from "./components/RitmicaConAlturas.tsx";
import RitmicaMetricaBaqueiro from "./components/RitmicaMetricaBaqueiro.tsx";
import LecturaMusical from "./components/LecturaMusical.tsx";
import LecturaGranPentagrama from "./components/LecturaGranPentagrama.tsx";
import DictadosIntervalos from "./components/DictadosIntervalos.tsx";
import TunerPage from "./components/TunerPage.tsx";
import CancionesMenu from "./components/CancionesMenu.jsx";
import BassArpeggiosPage from "./components/BassArpeggiosPage.tsx";
import RelativeMinorScalesStudy from "./components/RelativeMinorScalesStudy.tsx";
import ChordInversionsStudy from "./components/ChordInversionsStudy.tsx";
import MajorScaleChordTableStudy from "./components/MajorScaleChordTableStudy.tsx";
import SeventhChordHarmonicFieldStudy from "./components/SeventhChordHarmonicFieldStudy.tsx";
import WorkbookTheory from "./components/WorkbookTheory.tsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/dictados-react">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/afinador" element={<TunerPage />} />
        <Route path="/dictados" element={<DictadosMelodicos />} />
        <Route
          path="/dictados-gran-pentagrama"
          element={<DictadosGranPentagrama />}
        />
        <Route path="/dictados-intervalos" element={<DictadosIntervalos />} />
        <Route path="/intervalos" element={<EjerciciosIntervalos />} />
        <Route path="/bajo" element={<BajoTrainer />} />
        <Route path="/bajo-suite" element={<BassScaleSuite />} />
        <Route
          path="/bajo-circulo-quintas"
          element={<BassCircleOfFifthsPage />}
        />
        <Route path="/arpegios-bajo" element={<BassArpeggiosPage />} />
        <Route path="/vocal" element={<VocalTrainer />} />
        <Route path="/triadas" element={<TriadTrainer />} />
        <Route path="/intervalos-trainer" element={<IntervalsTrainer />} />
        <Route path="/ritmica" element={<RitmicaTrainer />} />
        <Route path="/ritmica-alturas" element={<RitmicaConAlturas />} />
        <Route path="/ritmica-metrica" element={<RitmicaMetricaBaqueiro />} />
        <Route path="/intervalos-piano" element={<IntervalosPiano />} />
        <Route path="/lectura-musical" element={<LecturaMusical />} />
        <Route
          path="/lectura-gran-pentagrama"
          element={<LecturaGranPentagrama />}
        />
        <Route
          path="/escalas-relativas"
          element={<RelativeMinorScalesStudy />}
        />
        <Route
          path="/inversiones-acordes"
          element={<ChordInversionsStudy />}
        />
        <Route
          path="/armonizacion-mayor"
          element={<MajorScaleChordTableStudy />}
        />
        <Route
          path="/campo-armonico-septimas"
          element={<SeventhChordHarmonicFieldStudy />}
        />
        <Route path="/workbook-teoria" element={<WorkbookTheory />} />
        <Route path="/workbook-teoria/:chapterId" element={<WorkbookTheory />} />
        <Route path="/canciones" element={<CancionesMenu />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
