# Specification: Data Persistence (Schema v2)

## Requirements

### Requirement: Grade configuration storage
The system SHALL store the prize configuration in localStorage key `ichibankuji_config` as JSON: `{ version: 2, grades: [{ grade: 'A'|'B'|'C'|'D'|'E'|'F', name: string, quantity: number }], lastOne: { name: string }, timestamp: number }`, with all six grades and the Last One prize always present.

#### Scenario: Configuration saved
- **WHEN** the admin applies a configuration
- **THEN** `ichibankuji_config` contains a version-2 object with six grade entries, a Last One prize entry, and a fresh timestamp

### Requirement: Game state storage with ticket pool
The system SHALL store the round state in localStorage key `ichibankuji_gameState` as JSON: `{ version: 2, tickets: [{ id: string, grade: string, drawn: boolean, drawnAt: number|null }], records: [{ timestamp, ticketId, grade, prizeName, lastOne?: true }] }`. The `tickets` array order IS the shuffled pool order and MUST NOT be re-shuffled outside of round reset. The record for the pool's final ticket SHALL carry `lastOne: true`.

#### Scenario: State saved after draw
- **WHEN** a draw occurs
- **THEN** the drawn ticket's `drawn`/`drawnAt` fields and the appended record are persisted immediately

#### Scenario: Multi-draw persisted atomically
- **WHEN** a 5連抽 batch completes its fifth pick
- **THEN** all five ticket updates and their five records are persisted in a single localStorage write

#### Scenario: Pool order stable
- **WHEN** the game state is read back after any number of reloads
- **THEN** the ticket order and hidden grades are identical to when the round started

### Requirement: Load and restore on app start
The system SHALL, on game page load, restore configuration and game state from localStorage; when no configuration exists, it SHALL seed the default A–F sample configuration and initialize a fresh shuffled pool from it.

#### Scenario: Fresh browser
- **WHEN** the app loads with empty localStorage
- **THEN** the default A–F sample configuration is saved and a new shuffled pool is created

#### Scenario: Mid-round reload
- **WHEN** the app loads with existing v2 state
- **THEN** the pool, stickers, and history display exactly as before the reload

### Requirement: v1 data migration
The system SHALL detect stored data lacking `version: 2` (the v1 free-form schema) and replace it with the default A–F configuration and a fresh pool, informing the user once that data was reset due to an upgrade. The system MUST NOT crash or render corrupt state when encountering v1 or malformed data.

#### Scenario: v1 data found
- **WHEN** the app loads and `ichibankuji_config` has no `version` field
- **THEN** config and game state are reinitialized to v2 defaults
- **AND** a one-time notice explains the reset

### Requirement: Write failure handling
The system SHALL handle localStorage write failures (e.g., quota exceeded) by showing an error message and keeping the previous in-memory state authoritative, never persisting a partial update.

#### Scenario: Quota exceeded
- **WHEN** a write to localStorage throws
- **THEN** the user sees an error message and the prior stored state remains intact
