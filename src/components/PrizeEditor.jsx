import React, { useState, useEffect } from 'react'
import {
  getConfig,
  setConfig,
  validateConfig,
  GOLD_GRADES,
  SUB_PRIZE_GRADES,
  MAX_TOTAL_TICKETS,
} from '../utils/storage'
import './PrizeEditor.css'

/**
 * Fixed A賞–F賞 grade editor. Each grade has an editable prize content and
 * quantity (0 = grade unused); grades cannot be added, deleted, or
 * reordered. Includes the Last One 賞 prize content.
 *
 * D/E/F rows additionally carry a sub-prize (variant) section with
 * add/remove rows; variant quantities must sum exactly to the grade's
 * quantity. Leaving the section empty keeps the grade a single item.
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
    setGrades(
      config.grades.map((g) => ({
        ...g,
        subPrizes: (g.subPrizes || []).map((s) => ({ ...s })),
      }))
    )
    setLastOneName(config.lastOne.name)
  }, [])

  const totalTickets = grades.reduce(
    (sum, g) => sum + (Number.isInteger(g.quantity) ? g.quantity : 0),
    0
  )

  const clearGradeErrors = (grade, field) => {
    const newErrors = { ...errors }
    if (field) {
      delete newErrors[`grade_${grade}_${field}`]
    }
    // Sub-prize rows reindex on add/remove, so clear the grade's whole sub set
    Object.keys(newErrors).forEach((key) => {
      if (key.startsWith(`grade_${grade}_sub`)) delete newErrors[key]
    })
    delete newErrors.general
    setErrors(newErrors)
  }

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
    clearGradeErrors(grade, field)
  }

  const handleAddSubPrize = (grade) => {
    setGrades(
      grades.map((g) =>
        g.grade === grade
          ? { ...g, subPrizes: [...g.subPrizes, { name: '', quantity: 1 }] }
          : g
      )
    )
    clearGradeErrors(grade)
  }

  const handleRemoveSubPrize = (grade, index) => {
    setGrades(
      grades.map((g) =>
        g.grade === grade
          ? { ...g, subPrizes: g.subPrizes.filter((_, i) => i !== index) }
          : g
      )
    )
    clearGradeErrors(grade)
  }

  const handleUpdateSubPrize = (grade, index, field, value) => {
    setGrades(
      grades.map((g) => {
        if (g.grade !== grade) return g
        const subPrizes = g.subPrizes.map((s, i) => {
          if (i !== index) return s
          if (field === 'quantity') {
            return { ...s, quantity: value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0) }
          }
          return { ...s, [field]: value }
        })
        return { ...g, subPrizes }
      })
    )
    clearGradeErrors(grade)
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

  const renderSubPrizeSection = (g) => {
    if (!SUB_PRIZE_GRADES.includes(g.grade)) return null

    const subTotal = g.subPrizes.reduce(
      (sum, s) => sum + (Number.isInteger(s.quantity) ? s.quantity : 0),
      0
    )
    const matches = subTotal === g.quantity

    return (
      <div className="sub-prize-section">
        {g.subPrizes.length > 0 && (
          <>
            <div className="sub-prize-header">
              <span>子獎項 Sub-prizes</span>
              <span className={`sub-total ${matches ? 'ok' : 'mismatch'}`}>
                {subTotal}/{g.quantity}
              </span>
            </div>
            {errors[`grade_${g.grade}_subPrizes`] && (
              <span className="field-error">{errors[`grade_${g.grade}_subPrizes`]}</span>
            )}
            {g.subPrizes.map((s, i) => (
              <div key={i} className="sub-prize-row">
                <div className="form-group sub-name">
                  <input
                    type="text"
                    value={s.name}
                    onChange={(e) => handleUpdateSubPrize(g.grade, i, 'name', e.target.value)}
                    placeholder={`款式 Variant ${i + 1}`}
                    className={errors[`grade_${g.grade}_sub_${i}_name`] ? 'input-error' : ''}
                  />
                  {errors[`grade_${g.grade}_sub_${i}_name`] && (
                    <span className="field-error">{errors[`grade_${g.grade}_sub_${i}_name`]}</span>
                  )}
                </div>
                <div className="form-group sub-quantity">
                  <input
                    type="number"
                    min="1"
                    value={s.quantity}
                    onChange={(e) => handleUpdateSubPrize(g.grade, i, 'quantity', e.target.value)}
                    className={errors[`grade_${g.grade}_sub_${i}_quantity`] ? 'input-error' : ''}
                  />
                  {errors[`grade_${g.grade}_sub_${i}_quantity`] && (
                    <span className="field-error">
                      {errors[`grade_${g.grade}_sub_${i}_quantity`]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-remove-sub"
                  onClick={() => handleRemoveSubPrize(g.grade, i)}
                  title="Remove this variant"
                >
                  ✕
                </button>
              </div>
            ))}
          </>
        )}
        <button
          type="button"
          className="btn-add-sub"
          onClick={() => handleAddSubPrize(g.grade)}
        >
          + 子獎項 Add variant
        </button>
        {g.subPrizes.length === 0 && (
          <span className="sub-prize-note">
            無子獎項時為單一獎品 (single prize when no variants)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="prize-editor">
      <h3>賞品設定 Grade Configuration</h3>

      {errors.general && <div className="error-message">{errors.general}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="grades-list">
        {grades.map((g) => (
          <div key={g.grade} className="grade-block">
            <div className="grade-row">
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
            {renderSubPrizeSection(g)}
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
