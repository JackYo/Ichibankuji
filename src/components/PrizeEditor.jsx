import React, { useState, useEffect } from 'react'
import { getConfig, setConfig, validateConfig, GOLD_GRADES, MAX_TOTAL_TICKETS } from '../utils/storage'
import './PrizeEditor.css'

/**
 * Fixed A賞–F賞 grade editor. Each grade has an editable prize content and
 * quantity (0 = grade unused); grades cannot be added, deleted, or
 * reordered. Includes the Last One 賞 prize content.
 */
export default function PrizeEditor() {
  const [grades, setGrades] = useState([])
  const [lastOneName, setLastOneName] = useState('')
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load current configuration on mount
  useEffect(() => {
    const config = getConfig()
    setGrades(config.grades.map((g) => ({ ...g })))
    setLastOneName(config.lastOne.name)
  }, [])

  const totalTickets = grades.reduce(
    (sum, g) => sum + (Number.isInteger(g.quantity) ? g.quantity : 0),
    0
  )

  const handleUpdateGrade = (grade, field, value) => {
    setGrades(
      grades.map((g) => {
        if (g.grade !== grade) return g
        if (field === 'quantity') {
          return { ...g, quantity: value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0) }
        }
        return { ...g, [field]: value }
      })
    )
    const newErrors = { ...errors }
    delete newErrors[`grade_${grade}_${field}`]
    delete newErrors.general
    setErrors(newErrors)
  }

  const handleUpdateLastOne = (value) => {
    setLastOneName(value)
    const newErrors = { ...errors }
    delete newErrors.lastOne_name
    setErrors(newErrors)
  }

  const handleApplyChanges = () => {
    setSuccessMessage('')
    const draft = { grades, lastOne: { name: lastOneName } }
    const newErrors = validateConfig(draft)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      const success = setConfig(draft)
      if (success) {
        setErrors({})
        setSuccessMessage(
          '✓ Configuration saved! It takes effect when the next round starts (New Round).'
        )
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setErrors({ general: 'Failed to save configuration. Please try again.' })
      }
    } catch (error) {
      console.error('Error applying changes:', error)
      setErrors({ general: 'Error saving configuration. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="prize-editor">
      <h3>賞品設定 Grade Configuration</h3>

      {errors.general && <div className="error-message">{errors.general}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="grades-list">
        {grades.map((g) => (
          <div key={g.grade} className="grade-row">
            <div
              className={`grade-label ${
                GOLD_GRADES.includes(g.grade) ? 'tier-gold' : 'tier-silver'
              }`}
            >
              {g.grade}賞
            </div>

            <div className="form-group grade-name">
              <label>Prize Content</label>
              <input
                type="text"
                value={g.name}
                onChange={(e) => handleUpdateGrade(g.grade, 'name', e.target.value)}
                placeholder="e.g., 豪華模型 Premium Figure"
                className={errors[`grade_${g.grade}_name`] ? 'input-error' : ''}
              />
              {errors[`grade_${g.grade}_name`] && (
                <span className="field-error">{errors[`grade_${g.grade}_name`]}</span>
              )}
            </div>

            <div className="form-group grade-quantity">
              <label>Quantity</label>
              <input
                type="number"
                min="0"
                value={g.quantity}
                onChange={(e) => handleUpdateGrade(g.grade, 'quantity', e.target.value)}
                className={errors[`grade_${g.grade}_quantity`] ? 'input-error' : ''}
              />
              {errors[`grade_${g.grade}_quantity`] && (
                <span className="field-error">{errors[`grade_${g.grade}_quantity`]}</span>
              )}
            </div>
          </div>
        ))}

        <div className="grade-row last-one-editor">
          <div className="grade-label tier-lastone">Last One</div>
          <div className="form-group grade-name">
            <label>Last One 賞 Prize</label>
            <input
              type="text"
              value={lastOneName}
              onChange={(e) => handleUpdateLastOne(e.target.value)}
              placeholder="e.g., 特別色模型 Special Figure"
              className={errors.lastOne_name ? 'input-error' : ''}
            />
            {errors.lastOne_name && <span className="field-error">{errors.lastOne_name}</span>}
          </div>
          <div className="form-group grade-quantity">
            <label>Quantity</label>
            <input type="number" value={1} disabled title="Always awarded with the final ticket" />
          </div>
        </div>
      </div>

      <div className="total-tickets">
        Total tickets: <strong>{totalTickets}</strong> / {MAX_TOTAL_TICKETS} max
      </div>

      <button
        type="button"
        className="btn-apply"
        onClick={handleApplyChanges}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Apply Changes'}
      </button>
    </div>
  )
}
