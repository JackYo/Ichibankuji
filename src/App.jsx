import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Game from './pages/Game'
import Admin from './pages/Admin'
import './App.css'

function App() {
  const navigate = useNavigate()

  const handleAdminLogout = () => {
    navigate('/game')
  }

  return (
    <Routes>
      <Route path="/game" element={<Game />} />
      <Route path="/admin" element={<Admin onLogout={handleAdminLogout} />} />
      <Route path="/" element={<Navigate to="/game" replace />} />
    </Routes>
  )
}

function RoutedApp() {
  return (
    <Router basename="/Ichibankuji">
      <App />
    </Router>
  )
}

export default RoutedApp
