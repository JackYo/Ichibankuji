import React, { useState } from 'react'
import { getConfig, getGameState, decrementPrizeQuantity, addDrawRecord } from '../utils/storage'
import './DrawButton.css'

/**
 * Weighted random draw algorithm
 * @param {Array} prizes - Array of prize objects with name and initialQuantity
 * @param {Object} quantities - Current remaining quantities for each prize
 * @returns {string} Name of the selected prize
 */
function weightedRandomDraw(prizes, quantities) {
  // Build cumulative sum array
  let total = 0
  const cumulativeWeights = []
  
  prizes.forEach((prize) => {
    const qty = quantities[prize.name] || 0
    cumulativeWeights.push(total + qty)
    total += qty
  })
  
  if (total === 0) return null
  
  // Select random number between 0 and total
  const random = Math.random() * total
  
  // Find which prize this random value falls into
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      return prizes[i].name
    }
  }
  
  // Fallback to last prize
  return prizes[prizes.length - 1].name
}

export default function DrawButton({ isDisabled, onDraw }) {
  const [isDrawing, setIsDrawing] = useState(false)

  const handleDraw = async () => {
    if (isDisabled || isDrawing) return
    
    setIsDrawing(true)
    
    try {
      // Get current state
      const config = getConfig()
      const gameState = getGameState()
      
      // Perform weighted random draw
      const selectedPrizeName = weightedRandomDraw(config.prizes, gameState.quantities)
      
      if (!selectedPrizeName) {
        setIsDrawing(false)
        return
      }
      
      // Decrement quantity
      const updatedState = decrementPrizeQuantity(selectedPrizeName)
      
      if (updatedState) {
        // Add draw record
        addDrawRecord(selectedPrizeName)
        
        // Notify parent with result
        onDraw({
          prizeName: selectedPrizeName,
          remainingQuantity: updatedState.quantities[selectedPrizeName],
        })
      }
    } catch (error) {
      console.error('Error during draw:', error)
    } finally {
      setIsDrawing(false)
    }
  }

  return (
    <button
      className="draw-button"
      onClick={handleDraw}
      disabled={isDisabled || isDrawing}
    >
      {isDrawing ? 'Drawing...' : 'Draw Prize'}
    </button>
  )
}
