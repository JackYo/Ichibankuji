import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getConfig,
  getGameState,
  getTotalRemaining,
  getPendingSelections,
  getSubPrizeStock,
  selectSubPrize,
  drawTickets,
  consumeMigrationNotice,
  MULTI_DRAW_COUNT,
} from '../utils/storage'
import TicketPool from '../components/TicketPool'
import StickerBoard from '../components/StickerBoard'
import DrawHistory from '../components/DrawHistory'
import ResultModal from '../components/ResultModal'
import SubPrizePicker from '../components/SubPrizePicker'
import NewRoundDialog from '../components/NewRoundDialog'
import './Game.css'

export default function Game() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [drawMode, setDrawMode] = useState('single')
  const [selectedIds, setSelectedIds] = useState([])
  const [revealResults, setRevealResults] = useState(null)
  const [showNewRoundDialog, setShowNewRoundDialog] = useState(false)
  const [showMigrationNotice, setShowMigrationNotice] = useState(false)

  // Initialize on mount
  useEffect(() => {
    const loadedConfig = getConfig()
    const loadedState = getGameState()
    setConfig(loadedConfig)
    setGameState(loadedState)
    if (consumeMigrationNotice()) {
      setShowMigrationNotice(true)
    }
  }, [])

  if (!config || !gameState) {
    return <div className="game-page loading">Loading...</div>
  }

  const totalRemaining = getTotalRemaining(gameState)
  const isGameOver = totalRemaining === 0
  const multiAvailable = totalRemaining >= MULTI_DRAW_COUNT

  // Committed wins still waiting for a variant choice (e.g. after a reload
  // mid-claim). Derived from records; drawing is gated until they're done.
  const pendingSelections = getPendingSelections(gameState)
  const hasPending = pendingSelections.length > 0

  const commitDraw = (ticketIds) => {
    const outcome = drawTickets(ticketIds)
    if (!outcome) {
      alert('Error saving the draw. Please try again.')
      return
    }
    setGameState({ ...outcome.state })
    setRevealResults(outcome.results)
    setSelectedIds([])
  }

  const handleSelectSubPrize = (ticketId, variantName) => {
    const updated = selectSubPrize(ticketId, variantName)
    if (!updated) {
      alert('Error saving your choice. Please try again.')
      return false
    }
    setGameState({ ...updated })
    return true
  }

  const handleTicketPick = (ticketId) => {
    if (revealResults || hasPending) return

    if (drawMode === 'single') {
      commitDraw([ticketId])
      return
    }

    // 5連抽: assemble the batch; nothing commits until the fifth pick
    let next
    if (selectedIds.includes(ticketId)) {
      next = selectedIds.filter((id) => id !== ticketId)
    } else {
      next = [...selectedIds, ticketId]
    }
    if (next.length === MULTI_DRAW_COUNT) {
      commitDraw(next)
    } else {
      setSelectedIds(next)
    }
  }

  const handleModeChange = (mode) => {
    setDrawMode(mode)
    setSelectedIds([])
  }

  // Multi mode requires ≥ 5 remaining; fall back to single when the pool shrinks
  if (drawMode === 'multi' && !multiAvailable) {
    setDrawMode('single')
    setSelectedIds([])
  }

  const handleCloseResult = () => {
    setRevealResults(null)
  }

  const handleNewRoundConfirm = () => {
    const updatedConfig = getConfig()
    const updatedState = getGameState()
    setConfig(updatedConfig)
    setGameState(updatedState)
    setRevealResults(null)
    setSelectedIds([])
    setDrawMode('single')
  }

  // First pending win (record order) — presented standalone when no reveal
  // modal is open, e.g. after a reload that interrupted the claim flow.
  const pendingClaim = !revealResults && hasPending ? pendingSelections[0] : null

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="header-top">
          <h1 onClick={() => navigate('/admin')} className="title-clickable">
            一番賞 Ichiban Kuji
          </h1>
          <button className="new-round-btn" onClick={() => setShowNewRoundDialog(true)}>
            New Round
          </button>
        </div>
        <p className="remaining-count">Tickets remaining: {totalRemaining}</p>
      </header>

      {showMigrationNotice && (
        <div className="migration-notice">
          <span>
            Saved data from an older version was found and has been reset to the new A賞–F賞
            format.
          </span>
          <button onClick={() => setShowMigrationNotice(false)}>✕</button>
        </div>
      )}

      <main className="game-main">
        <section className="board-section">
          <h2>賞品一覽 Prize Board</h2>
          <StickerBoard config={config} gameState={gameState} />
        </section>

        <section className="pool-section">
          <div className="pool-header">
            <h2>抽籤 Pick a Ticket</h2>
            {!isGameOver && (
              <div className="mode-toggle" role="group" aria-label="Draw mode">
                <button
                  type="button"
                  className={drawMode === 'single' ? 'active' : ''}
                  onClick={() => handleModeChange('single')}
                >
                  單抽
                </button>
                <button
                  type="button"
                  className={drawMode === 'multi' ? 'active' : ''}
                  onClick={() => handleModeChange('multi')}
                  disabled={!multiAvailable}
                  title={multiAvailable ? '' : `Needs at least ${MULTI_DRAW_COUNT} tickets remaining`}
                >
                  5連抽
                </button>
              </div>
            )}
          </div>
          {hasPending && (
            <p className="pending-hint">
              請先完成領獎 — complete your prize selection before drawing again.
            </p>
          )}
          {drawMode === 'multi' && !isGameOver && (
            <p className="multi-hint">
              Pick {MULTI_DRAW_COUNT} tickets — {selectedIds.length}/{MULTI_DRAW_COUNT} selected.
              The draw happens when the fifth ticket is picked.
            </p>
          )}
          <TicketPool
            tickets={gameState.tickets}
            selectedIds={selectedIds}
            onTicketPick={handleTicketPick}
            disabled={!!revealResults || hasPending}
          />
        </section>

        <section className="history-section">
          <h2>Draw History</h2>
          <DrawHistory
            records={gameState.records}
            pendingTicketIds={new Set(pendingSelections.map((r) => r.ticketId))}
          />
        </section>
      </main>

      {revealResults && (
        <ResultModal
          results={revealResults}
          getSubPrizeStock={(grade) => getSubPrizeStock(gameState, grade)}
          onSelectSubPrize={handleSelectSubPrize}
          onClose={handleCloseResult}
        />
      )}

      {pendingClaim && (
        <div className="modal-overlay">
          <div className="modal-content reveal-modal">
            <p className="pending-picker-note">
              你還有 {pendingSelections.length} 個獎品未領取 — finish claiming your prize!
            </p>
            <SubPrizePicker
              grade={pendingClaim.grade}
              prizeName={pendingClaim.prizeName}
              stock={getSubPrizeStock(gameState, pendingClaim.grade)}
              onSelect={(variantName) => handleSelectSubPrize(pendingClaim.ticketId, variantName)}
            />
          </div>
        </div>
      )}

      <NewRoundDialog
        isOpen={showNewRoundDialog}
        onClose={() => setShowNewRoundDialog(false)}
        onConfirm={handleNewRoundConfirm}
      />
    </div>
  )
}
