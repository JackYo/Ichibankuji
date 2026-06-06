import React, { useState } from 'react'
import PrizeEditor from '../components/PrizeEditor'
import './Admin.css'

const ADMIN_PASSWORD = 'admin123' // Hardcoded password (change this to configure access)

export default function Admin({ onLogout }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setPassword('')
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setError('')
    onLogout()
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="login-container">
          <h1>Admin Panel</h1>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="btn-login">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page authenticated">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="admin-main">
        <section className="config-section">
          <h2>Prize Configuration</h2>
          <PrizeEditor />
        </section>
      </main>
    </div>
  )
}
