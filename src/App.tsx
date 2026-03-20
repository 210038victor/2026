import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { useLessonStore } from './stores/lessonStore';
import { CircuitCanvas } from './components/canvas/CircuitCanvas';
import { ComponentPalette } from './components/toolbar/ComponentPalette';
import { ActionBar } from './components/toolbar/ActionBar';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { LessonCatalog } from './components/lessons/LessonCatalog';
import { LessonPlayer } from './components/lessons/LessonPlayer';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';
import './App.css';

// Import lesson data
import ohmsLaw from './data/lessons/ohms-law.json';
import kvl from './data/lessons/kvl.json';
import type { Lesson } from './types/circuit';

const LESSONS: Lesson[] = [ohmsLaw as Lesson, kvl as Lesson];

function CanvasPage() {
  return (
    <div className="canvas-page">
      <div className="sidebar">
        <ComponentPalette />
        <SimulationPanel />
      </div>
      <div className="canvas-area">
        <ActionBar />
        <CircuitCanvas />
      </div>
    </div>
  );
}

function AppContent() {
  const setLessons = useLessonStore(s => s.setLessons);

  useEffect(() => {
    setLessons(LESSONS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">⚡ 互動電路分析</div>
        <nav className="app-nav">
          <NavLink to="/" end>畫布</NavLink>
          <NavLink to="/lessons">課程</NavLink>
          <NavLink to="/dashboard">進度</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CanvasPage />} />
          <Route path="/lessons" element={<LessonCatalog />} />
          <Route path="/lessons/:id" element={<LessonPlayer />} />
          <Route path="/dashboard" element={<ProgressDashboard />} />
          <Route path="*" element={<CanvasPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename="/2026">
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
