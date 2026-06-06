# Specification: Data Persistence

## Overview

Game state, prize configuration, and admin settings are persisted in browser localStorage to survive page reloads and browser close/reopen cycles.

## Requirements

### 1. Prize Configuration Storage
- **ADDED**: Store prize configuration in localStorage
- **WHEN** admin applies new configuration
- **THEN** save to localStorage key `ichibankuji_config`
- **AND** store as JSON object with: prizes array, timestamp
- **Format**: `{ prizes: [{name, initialQuantity}, ...], timestamp }`

### 2. Game State Storage
- **ADDED**: Store current game quantities and draw history in localStorage
- **WHEN** draw occurs or round resets
- **THEN** update localStorage key `ichibankuji_gameState`
- **AND** store as JSON object with: current quantities, draw records
- **Format**: `{ quantities: {prizeName: count, ...}, records: [{timestamp, prizeName, remainingQty}, ...] }`

### 3. Quantity Persistence
- **ADDED**: Preserve remaining quantities across page reloads
- **WHEN** user closes and reopens browser/page
- **THEN** load quantities from localStorage
- **AND** display exactly as they were before reload
- **AND** draw history also restored

### 4. Configuration Load on App Start
- **ADDED**: Load prize configuration on app initialization
- **WHEN** game page loads for first time
- **THEN** check if configuration exists in localStorage
- **IF** configuration exists, use it for game state initialization
- **IF** no configuration, use default sample configuration (TBD)

### 5. Round Reset Clearing
- **ADDED**: Clear quantities and history on new round
- **WHEN** user confirms "New Round" action
- **THEN** clear draw records from `ichibankuji_gameState`
- **AND** reset quantities to initial values from configuration
- **AND** persist cleared state to localStorage immediately

### 6. localStorage Quota Management
- **ADDED**: Handle localStorage quota gracefully
- **WHEN** localStorage write fails due to quota
- **THEN** show error message to user
- **AND** log error for debugging
- **AND** prevent loss of data (keep old state if new write fails)

## Implementation Notes

- localStorage keys: `ichibankuji_config`, `ichibankuji_gameState`, `ichibankuji_adminPassword` (if needed)
- JSON serialization for all stored objects
- Check localStorage availability on app start
- Consider adding versioning to schema for future compatibility
- No IndexedDB needed for current scope (localStorage sufficient)
