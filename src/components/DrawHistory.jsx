import React from 'react'
import './DrawHistory.css'

export default function DrawHistory({ records }) {
  if (records.length === 0) {
    return (
      <div className="draw-history empty">
        <p>No draws yet. Click "Draw Prize" to start!</p>
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
            <th>Prize</th>
            <th>Time</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record, index) => (
            <tr key={index}>
              <td>{records.length - index}</td>
              <td>{record.prizeName}</td>
              <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
              <td>{record.remainingQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
