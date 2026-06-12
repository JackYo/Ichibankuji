import React, { useState, useEffect } from 'react'
import { GOLD_GRADES } from '../utils/storage'
import './ResultModal.css'

/**
 * Sequential ticket reveal. Each result flips from a sealed ticket to its
 * grade + prize; a 5連抽 batch is revealed one result at a time in pick
 * order. The Last One prize gets an extra celebration banner.
 */
export default function ResultModal({ results, onClose }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const current = results[index]
  const isLast = index === results.length - 1

  // Flip the ticket open shortly after it is presented
  useEffect(() => {
    setRevealed(false)
    const timer = setTimeout(() => setRevealed(true), 350)
    return () => clearTimeout(timer)
  }, [index])

  if (!current) return null

  const tier = GOLD_GRADES.includes(current.grade) ? 'gold' : 'silver'

  const handleNext = () => {
    if (isLast) {
      onClose()
    } else {
      setIndex(index + 1)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content reveal-modal" onClick={(e) => e.stopPropagation()}>
        {results.length > 1 && (
          <p className="reveal-progress">
            {index + 1} / {results.length}
          </p>
        )}

        <div className={`reveal-ticket ${revealed ? 'revealed' : ''}`}>
          <div className="reveal-face reveal-back">
            <span className="reveal-seal">封</span>
            <span>一番賞</span>
          </div>
          <div className={`reveal-face reveal-front tier-${tier}`}>
            <span className="reveal-grade">{current.grade}賞</span>
            <span className="reveal-prize">{current.prizeName}</span>
            <span className="reveal-ticket-id">{current.ticketId}</span>
          </div>
        </div>

        {revealed && current.lastOne && (
          <div className="last-one-banner">
            <p className="last-one-title">🎊 LAST ONE 賞 🎊</p>
            <p className="last-one-prize">{current.lastOnePrizeName}</p>
            <p className="last-one-note">You drew the final ticket and win the Last One prize too!</p>
          </div>
        )}

        <button className="modal-button" onClick={handleNext} disabled={!revealed}>
          {isLast ? 'Close' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
