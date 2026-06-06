# Specification: Game Round Reset

## Overview

Users can start a new round with the "New Round" button. A confirmation dialog prevents accidental data loss. On confirmation, all quantities reset to initial values and draw history clears.

## Requirements

### 1. New Round Button
- **ADDED**: Add "New Round" button to game page
- **WHEN** game page displays
- **THEN** show "New Round" button in header or bottom area
- **AND** button always visible and accessible

### 2. Confirmation Dialog
- **ADDED**: Show confirmation dialog before clearing state
- **WHEN** user clicks "New Round" button
- **THEN** display modal asking for confirmation
- **AND** warn user that current round data will be lost
- **AND** show "Cancel" and "Confirm" options

### 3. Reset Logic on Confirmation
- **ADDED**: Clear game state and reinitialize with configuration
- **WHEN** user confirms in dialog
- **THEN** clear all draw records (history)
- **AND** reset all quantities to initial values from configuration
- **AND** keep admin configuration unchanged
- **AND** persist cleared state to localStorage

### 4. Configuration Application
- **ADDED**: Apply new admin configuration on round reset if available
- **WHEN** new round starts
- **THEN** if new configuration pending in localStorage, apply it
- **AND** use new configuration for next round's quantities
- **AND** update display immediately

### 5. UI Feedback
- **ADDED**: Show feedback after successful reset
- **WHEN** round successfully resets
- **THEN** close confirmation dialog
- **AND** show success message or toast
- **AND** display fresh prize grid with reset quantities
- **AND** clear history display

### 6. Error Handling
- **ADDED**: Handle localStorage errors gracefully
- **WHEN** reset operation fails (e.g., quota exceeded)
- **THEN** show error message
- **AND** keep current state unchanged
- **AND** allow retry

## Implementation Notes

- Confirmation dialog prevents accidental loss of draw history
- Reset always applies current admin configuration (ensuring next round uses latest settings)
- No confirmation needed for canceling dialog
- After reset, draw history is completely cleared (not archived)
