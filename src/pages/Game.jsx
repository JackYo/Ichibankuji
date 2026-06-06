import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConfig, getGameState, getTotalRemaining } from '../utils/storage'
import PrizeGrid from '../components/PrizeGrid'
import DrawButton from '../components/DrawButton'
import DrawHistory from '../components/DrawHistory'
import ResultModal from '../components/ResultModal'
import NewRoundDialog from '../components/NewRoundDialog'
import './Game.css'

export default function Game() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showNewRoundDialog, setShowNewRoundDialog] = useState(false)

  // Initialize on mount
  useEffect(() => {
    const loadedConfig = getConfig()
    const loadedState = getGameState()
    setConfig(loadedConfig)
    setGameState(loadedState)
  }, [])

  const handleDrawComplete = (prizeResult) => {
    setResult(prizeResult)
    setShowResult(true)
    // Reload game state to reflect changes
    const updatedState = getGameState()
    setGameState(updatedState)
  }

  const handleCloseResult = () => {
    setShowResult(false)
    setResult(null)
  }

  const handleNewRound = () => {
    setShowNewRoundDialog(true)
  }

  const handleNewRoundConfirm = () => {
    // Reload game state to reflect reset
    const updatedState = getGameState()
    setGameState(updatedState)
    setResult(null)
    setShowResult(false)
  }

  const handleAdminAccess = () => {
    navigate('/admin')
  }

  if (!config || !gameState) {
    return <div className="game-page loading">Loading...</div>
  }

  const totalRemaining = getTotalRemaining()
  const isGameOver = totalRemaining === 0

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="header-top">
          <h1 onClick={handleAdminAccess} className="title-clickable">
            一番賞 Lottery
          </h1>
          <button 
            className="new-round-btn"
            onClick={handleNewRound}
          >
            New Round
          </button>
        </div>
        <p className="remaining-count">Remaining: {totalRemaining}</p>
      </header>

      <main className="game-main">
        <section className="prize-section">
          <h2>Available Prizes</h2>
          <PrizeGrid 
            prizes={config.prizes} 
            quantities={gameState.quantities}
          />
        </section>

        <section className="draw-section">
          <DrawButton 
            isDisabled={isGameOver}
            onDraw={handleDrawComplete}
          />
        </section>

        <section className="history-section">
          <h2>Draw History</h2>
          <DrawHistory records={gameState.records} />
        </section>
      </main>

      {showResult && (
        <ResultModal 
          result={result}
          onClose={handleCloseResult}
        />
      )}

      <NewRoundDialog 
        isOpen={showNewRoundDialog}
        onClose={() => setShowNewRoundDialog(false)}
        onConfirm={handleNewRoundConfirm}
      />
    </div>
  )
}
