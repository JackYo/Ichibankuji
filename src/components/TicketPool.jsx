import React from 'react'
import './TicketPool.css'

/**
 * The kuji box: every undrawn ticket rendered face-down in its fixed pool
 * position. The player draws by tapping a specific ticket. In 5連抽 mode,
 * tickets show their pick order while the batch is being assembled.
 */
export default function TicketPool({ tickets, selectedIds, onTicketPick, disabled }) {
  const undrawn = tickets.filter((t) => !t.drawn)

  if (undrawn.length === 0) {
    return (
      <div className="ticket-pool sold-out">
        <p className="sold-out-banner">🎊 完売御礼 SOLD OUT 🎊</p>
        <p>All tickets have been drawn. Start a new round!</p>
      </div>
    )
  }

  return (
    <div className="ticket-pool">
      {undrawn.map((ticket) => {
        const pickOrder = selectedIds.indexOf(ticket.id)
        const isSelected = pickOrder !== -1
        return (
          <button
            key={ticket.id}
            type="button"
            className={`ticket ${isSelected ? 'selected' : ''}`}
            onClick={() => onTicketPick(ticket.id)}
            disabled={disabled}
            aria-label={`Sealed ticket ${ticket.id}`}
          >
            <span className="ticket-seal">封</span>
            <span className="ticket-text">一番賞</span>
            {isSelected && <span className="ticket-pick-order">{pickOrder + 1}</span>}
          </button>
        )
      })}
    </div>
  )
}
