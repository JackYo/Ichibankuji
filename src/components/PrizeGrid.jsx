import React from 'react'
import './PrizeGrid.css'

export default function PrizeGrid({ prizes, quantities }) {
  return (
    <div className="prize-grid">
      {prizes.map((prize) => (
        <div key={prize.name} className="prize-card">
          <div className="prize-name">{prize.name}</div>
          <div className="prize-quantity">
            {quantities[prize.name] || 0} remaining
          </div>
          <div className="prize-bar">
            <div 
              className="prize-bar-fill"
              style={{
                width: `${(quantities[prize.name] / prize.initialQuantity) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
