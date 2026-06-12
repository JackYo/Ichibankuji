import React from 'react'
import './SubPrizePicker.css'

/**
 * Sub-prize pool: the winner of a D/E/F ticket picks their variant from the
 * remaining stock — a deliberate choice, never a draw. Out-of-stock variants
 * stay visible (like empty shelf slots) but cannot be tapped. Even when only
 * one variant remains the player still taps it explicitly.
 *
 * Props:
 *   grade     - parent grade letter ('D'|'E'|'F')
 *   prizeName - parent prize content
 *   stock     - [{ name, total, remaining }] derived live from records
 *   onSelect  - (variantName) => void
 */
export default function SubPrizePicker({ grade, prizeName, stock, onSelect }) {
  return (
    <div className="sub-prize-picker">
      <p className="picker-heading">
        <span className="picker-grade">{grade}賞</span> {prizeName}
      </p>
      <p className="picker-instruction">挑一個喜歡的款式吧! Pick the design you like:</p>
      <div className="variant-list">
        {stock.map((v) => {
          const soldOut = v.remaining <= 0
          return (
            <button
              key={v.name}
              type="button"
              className={`variant-option ${soldOut ? 'sold-out' : ''}`}
              disabled={soldOut}
              onClick={() => onSelect(v.name)}
            >
              <span className="variant-name">{v.name}</span>
              <span className="variant-stock">
                {soldOut ? '完売' : `${v.remaining}/${v.total}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
