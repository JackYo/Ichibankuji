import React, { useRef } from 'react'
import { getDrawnCountByGrade, getTotalRemaining, GOLD_GRADES } from '../utils/storage'
import './StickerBoard.css'

/**
 * The store prize board (賞品一覽): one row per active grade with one slot
 * per ticket. Claimed slots are covered by a sticker — gold for A–C, silver
 * for D–F — derived entirely from the draw records. The Last One 賞 row
 * flips to claimed when the pool empties.
 */
export default function StickerBoard({ config, gameState }) {
  const drawnByGrade = getDrawnCountByGrade(gameState)
  const lastOneClaimed = getTotalRemaining(gameState) === 0

  // Remember previous drawn counts so only newly pasted stickers animate
  // (not every sticker on reload/re-render)
  const prevDrawnRef = useRef(drawnByGrade)
  const prevDrawn = prevDrawnRef.current
  prevDrawnRef.current = drawnByGrade

  const activeGrades = config.grades.filter((g) => g.quantity > 0)

  return (
    <div className="sticker-board">
      {activeGrades.map((g) => {
        const drawn = drawnByGrade[g.grade]
        const remaining = g.quantity - drawn
        const soldOut = remaining === 0
        const tier = GOLD_GRADES.includes(g.grade) ? 'gold' : 'silver'

        return (
          <div key={g.grade} className={`board-row ${soldOut ? 'sold-out' : ''}`}>
            <div className={`board-grade tier-${tier}`}>{g.grade}賞</div>
            <div className="board-info">
              <div className="board-prize-name">
                {g.name}
                {soldOut && <span className="sold-out-tag">完売</span>}
              </div>
              <div className="board-slots">
                {Array.from({ length: g.quantity }, (_, i) => {
                  const stickered = i < drawn
                  const fresh = stickered && i >= (prevDrawn[g.grade] ?? 0)
                  return (
                    <span
                      key={i}
                      className={`board-slot ${stickered ? `stickered tier-${tier}` : ''} ${
                        fresh ? 'fresh' : ''
                      }`}
                    >
                      {stickered ? '済' : ''}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="board-count">
              {remaining}/{g.quantity}
            </div>
          </div>
        )
      })}

      <div className={`board-row last-one-row ${lastOneClaimed ? 'claimed' : ''}`}>
        <div className="board-grade tier-lastone">Last One</div>
        <div className="board-info">
          <div className="board-prize-name">{config.lastOne.name}</div>
          <div className="last-one-status">
            {lastOneClaimed ? '🎊 Claimed with the final ticket!' : 'Awarded with the final ticket'}
          </div>
        </div>
        <div className="board-count">{lastOneClaimed ? '0/1' : '1/1'}</div>
      </div>
    </div>
  )
}
