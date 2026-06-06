import React, { useState } from 'react'
import { resetGameState, getConfig } from '../utils/storage'
import './NewRoundDialog.css'

export default function NewRoundDialog({ isOpen, onClose, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const success = resetGameState()
      if (success) {
        onConfirm()
        onClose()
      } else {
        alert('Error resetting game state. Please try again.')
      }
    } catch (error) {
      console.error('Error resetting game:', error)
      alert('Error resetting game state. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Start New Round?</h2>
        <div className="dialog-message">
          <p className="warning">⚠️ This will clear all draw history</p>
          <p>All current draw records will be lost and quantities will reset.</p>
          <p>Are you sure you want to continue?</p>
        </div>
        <div className="dialog-buttons">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
