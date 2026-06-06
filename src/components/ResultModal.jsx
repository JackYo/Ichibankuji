import React from 'react'
import './ResultModal.css'

export default function ResultModal({ result, onClose }) {
  if (!result) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>🎉 Congratulations! 🎉</h2>
        <div className="result-display">
          <p className="prize-result">{result.prizeName}</p>
          <p className="remaining-info">
            {result.remainingQuantity} remaining
          </p>
        </div>
        <button className="modal-button" onClick={onClose}>
          Draw Again
        </button>
      </div>
    </div>
  )
}
