import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'

function CanvasPage() {
  return <div className="page"><h1>Circuit Canvas</h1><p>互動電路畫布（Phase 3 實作）</p></div>
}

function LessonsPage() {
  return <div className="page"><h1>課程</h1><p>引導式課程（Phase 3 實作）</p></div>
}

function DashboardPage() {
  return <div className="page"><h1>學習進度</h1><p>學習進度儀表板（Phase 3 實作）</p></div>
}

function ExercisesPage() {
  return <div className="page"><h1>練習題</h1><p>練習題列表（Phase 3 實作）</p></div>
}

function App() {
  return (
    <BrowserRouter basename="/2026">
      <nav className="nav">
        <NavLink to="/" end>畫布</NavLink>
        <NavLink to="/lessons">課程</NavLink>
        <NavLink to="/exercises">練習題</NavLink>
        <NavLink to="/dashboard">儀表板</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<CanvasPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
