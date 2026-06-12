import React, { useState, useEffect } from 'react'
import { GOLD_GRADES } from '../utils/storage'
import SubPrizePicker from './SubPrizePicker'
import './ResultModal.css'

/**
 * Sequential ticket reveal. Each result flips from a sealed ticket to its
 * grade + prize; a 5連抽 batch is revealed one result at a time in pick
 * order. The Last One prize gets an extra celebration banner.
 *
 * Results of grades with sub-prizes chain into a variant picker after the
 * flip: the continue button leads to the picker, and the chosen variant
 * advances to the next reveal (or closes). The reveal itself never shows a
 * variant — the draw only decides the grade.
 *
 * Props:
 *   results          - [{ ticketId, grade, prizeName, hasSubPrizes, ... }]
 *   getSubPrizeStock - (grade) => [{ name, total, remaining }] (live)
 *   onSelectSubPrize - (ticketId, variantName) => boolean
 *   onClose          - () => void
 */
export default function ResultModal({ results, getSubPrizeStock, onSelectSubPrize, onClose }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [picking, setPicking] = useState(false)

  const current = results[index]
  const isLast = index === results.length - 1

  // Flip the ticket open shortly after it is presented
  useEffect(() => {
    setRevealed(false)
    setPicking(false)
    const timer = setTimeout(() => setRevealed(true), 350)
    return () => clearTimeout(timer)
  }, [index])

  if (!current) return null

  const tier = GOLD_GRADES.includes(current.grade) ? 'gold' : 'silver'

  const advance = () => {
    if (isLast) {
      onClose()
    } else {
      setIndex(index + 1)
    }
  }

  const handleNext = () => {
    if (current.hasSubPrizes) {
      setPicking(true)
    } else {
      advance()
    }
  }

  const handleVariantSelect = (variantName) => {
    if (onSelectSubPrize(current.ticketId, variantName)) {
      advance()
    }
  }

  if (picking) {
    return (
      <div className="modal-overlay">
        <div className="modal-content reveal-modal" onClick={(e) => e.stopPropagation()}>
          {results.length > 1 && (
            <p className="reveal-progress">
              {index + 1} / {results.length}
            </p>
          )}
          <SubPrizePicker
            grade={current.grade}
            prizeName={current.prizeName}
            stock={getSubPrizeStock(current.grade)}
            onSelect={handleVariantSelect}
          />
        </div>
      </div>
    )
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
          {current.hasSubPrizes ? '選擇款式 →' : isLast ? 'Close' : 'Next →'}
        </button>
      </div>
    </div>
  )
}
