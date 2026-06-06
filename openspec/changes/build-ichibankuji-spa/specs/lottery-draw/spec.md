# Specification: Lottery Draw Mechanics

## Overview

The lottery draw system allows users to randomly select prizes from a configured pool, with quantities auto-decrementing and history tracking.

## Requirements

### 1. Weighted Random Draw Algorithm
- **ADDED**: Implement random draw that selects prizes proportional to remaining quantities
- **WHEN** user clicks "Draw" button with available prizes
- **THEN** system selects prize weighted by remaining quantity
- **AND** probability of selection = remaining_quantity / total_remaining

### 2. Quantity Management  
- **ADDED**: Decrement selected prize quantity after successful draw
- **WHEN** prize is drawn successfully
- **THEN** quantity for that prize decreases by 1
- **AND** display updates immediately
- **AND** new state persists to localStorage

### 3. Draw History Recording
- **ADDED**: Record each draw with timestamp and prize details
- **WHEN** prize is drawn
- **THEN** create record with: timestamp, prize name, remaining quantity at time of draw
- **AND** add to current round's history
- **AND** history persists across page reloads

### 4. Draw Result Display
- **ADDED**: Show modal/toast with prize result and congratulatory message
- **WHEN** draw completes successfully
- **THEN** display modal showing prize name and quantity remaining
- **AND** include option to close or draw again

### 5. Draw Validation
- **ADDED**: Disable draw button when no prizes remain
- **WHEN** total remaining quantity reaches 0
- **THEN** "Draw" button disabled
- **AND** "New Round" button becomes primary action

### 6. localStorage Persistence
- **ADDED**: Save game state after each draw operation
- **WHEN** draw completes
- **THEN** update localStorage with new game state
- **AND** quantities and history must survive page reload

## Implementation Notes

- Use accumulator algorithm for weighted selection: build cumulative sum of quantities, select random number, find prize matching that range
- Store draw records with millisecond timestamps
- Keep all history records for current round (no deletion or truncation)
