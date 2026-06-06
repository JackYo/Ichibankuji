import React, { useState, useEffect } from 'react'
import { getConfig, setConfig } from '../utils/storage'
import './PrizeEditor.css'

export default function PrizeEditor() {
  const [prizes, setPrizes] = useState([])
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load current configuration on mount
  useEffect(() => {
    const config = getConfig()
    setPrizes(config.prizes || [])
  }, [])

  const handleAddPrize = () => {
    setPrizes([...prizes, { name: '', initialQuantity: 1 }])
    setErrors({})
  }

  const handleDeletePrize = (index) => {
    setPrizes(prizes.filter((_, i) => i !== index))
    setErrors({})
  }

  const handleUpdatePrize = (index, field, value) => {
    const updated = [...prizes]
    if (field === 'initialQuantity') {
      updated[index][field] = Math.max(0, parseInt(value) || 0)
    } else {
      updated[index][field] = value
    }
    setPrizes(updated)
    // Clear error for this field
    const newErrors = { ...errors }
    delete newErrors[`prize_${index}_${field}`]
    setErrors(newErrors)
  }

  const validateConfiguration = () => {
    const newErrors = {}
    
    if (prizes.length === 0) {
      newErrors.general = 'At least one prize is required'
      return newErrors
    }

    prizes.forEach((prize, index) => {
      if (!prize.name || prize.name.trim() === '') {
        newErrors[`prize_${index}_name`] = 'Prize name is required'
      }
      if (!prize.initialQuantity || prize.initialQuantity < 1) {
        newErrors[`prize_${index}_quantity`] = 'Quantity must be at least 1'
      }
    })

    return newErrors
  }

  const handleApplyChanges = async () => {
    setSuccessMessage('')
    const newErrors = validateConfiguration()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      const success = setConfig({ prizes })
      if (success) {
        setErrors({})
        setSuccessMessage('✓ Configuration saved successfully! Changes will apply to the next round.')
        setTimeout(() => setSuccessMessage(''), 4000)
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
      <h3>Configure Prizes</h3>
      
      {errors.general && <div className="error-message">{errors.general}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="prizes-list">
        {prizes.map((prize, index) => (
          <div key={index} className="prize-row">
            <div className="form-group">
              <label>Prize Name</label>
              <input
                type="text"
                value={prize.name}
                onChange={(e) => handleUpdatePrize(index, 'name', e.target.value)}
                placeholder="e.g., Gold Prize"
                className={errors[`prize_${index}_name`] ? 'input-error' : ''}
              />
              {errors[`prize_${index}_name`] && (
                <span className="field-error">{errors[`prize_${index}_name`]}</span>
              )}
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={prize.initialQuantity}
                onChange={(e) => handleUpdatePrize(index, 'initialQuantity', e.target.value)}
                className={errors[`prize_${index}_quantity`] ? 'input-error' : ''}
              />
              {errors[`prize_${index}_quantity`] && (
                <span className="field-error">{errors[`prize_${index}_quantity`]}</span>
              )}
            </div>

            <button
              type="button"
              className="btn-delete"
              onClick={() => handleDeletePrize(index)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn-add-prize"
        onClick={handleAddPrize}
      >
        + Add Prize
      </button>

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
