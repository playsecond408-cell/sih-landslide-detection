import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CommandCenter from './pages/CommandCenter';
import SusceptibilityExplorer from './pages/SusceptibilityExplorer';
import EvacuationManager from './pages/EvacuationManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/susceptibility" element={<SusceptibilityExplorer />} />
        <Route path="/evacuation" element={<EvacuationManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
