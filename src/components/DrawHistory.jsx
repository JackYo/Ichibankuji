import React from 'react'
import { GOLD_GRADES } from '../utils/storage'
import './DrawHistory.css'

export default function DrawHistory({ records, pendingTicketIds = new Set() }) {
  if (records.length === 0) {
    return (
      <div className="draw-history empty">
        <p>No draws yet. Pick a ticket to start!</p>
      </div>
    )
  }

  // Display most recent draws first
  const sortedRecords = [...records].reverse()

  return (
    <div className="draw-history">
      <table className="history-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ticket</th>
            <th>賞</th>
            <th>Prize</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record, index) => (
            <tr key={record.ticketId}>
              <td>{records.length - index}</td>
              <td>{record.ticketId}</td>
              <td>
                <span
                  className={`grade-badge ${
                    GOLD_GRADES.includes(record.grade) ? 'gold' : 'silver'
                  }`}
                >
                  {record.grade}賞
                </span>
              </td>
              <td>
                {record.prizeName}
                {record.subPrizeName && (
                  <span className="sub-prize-name">{record.subPrizeName}</span>
                )}
                {pendingTicketIds.has(record.ticketId) && (
                  <span className="sub-prize-pending">選擇中…</span>
                )}
                {record.lastOne && <span className="last-one-badge">LAST ONE 賞</span>}
              </td>
              <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
