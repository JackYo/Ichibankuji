# Delta: Data Persistence — Schema v3 (Sub-Prizes)

## ADDED Requirements

### Requirement: Sub-prize selection persistence
The system SHALL persist a variant selection immediately when chosen, by writing `subPrizeName` onto the originating draw record in a single localStorage write. Variant remaining stock SHALL be derived as the snapshot quantity minus the count of records carrying that variant name for that grade — no separate stock counter is stored.

#### Scenario: Selection persisted on tap
- **WHEN** the player claims a variant in the sub-prize pool
- **THEN** the draw record gains `subPrizeName` in localStorage before any further interaction is required

#### Scenario: Derived stock after reload
- **WHEN** the page reloads mid-round
- **THEN** every variant's remaining stock equals its snapshot quantity minus its selected count in the records

### Requirement: v2 to v3 upgrade
The system SHALL upgrade stored `version: 2` data to version 3 losslessly and silently: configuration grades gain empty `subPrizes`, the game state gains an empty sub-prize snapshot, and all tickets and records are preserved. The current round continues uninterrupted and no reset notice is shown.

#### Scenario: v2 data found mid-round
- **WHEN** the app loads with v2 config and game state from a round in progress
- **THEN** both are rewritten as version 3 with the pool, stickers, and history intact, and no migration notice appears

## RENAMED Requirements

- FROM: `### Requirement: v1 data migration`
- TO: `### Requirement: Legacy and malformed data reset`

## MODIFIED Requirements

### Requirement: Grade configuration storage
The system SHALL store the prize configuration in localStorage key `ichibankuji_config` as JSON: `{ version: 3, grades: [{ grade: 'A'|'B'|'C'|'D'|'E'|'F', name: string, quantity: number, subPrizes?: [{ name: string, quantity: number }] }], lastOne: { name: string }, timestamp: number }`, with all six grades and the Last One prize always present. `subPrizes` MAY only be non-empty on grades D, E, F, and when present its quantities sum exactly to the grade's quantity.

#### Scenario: Configuration saved
- **WHEN** the admin applies a configuration
- **THEN** `ichibankuji_config` contains a version-3 object with six grade entries, any configured sub-prize lists on D/E/F, a Last One prize entry, and a fresh timestamp

### Requirement: Game state storage with ticket pool
The system SHALL store the round state in localStorage key `ichibankuji_gameState` as JSON: `{ version: 3, tickets: [{ id: string, grade: string, drawn: boolean, drawnAt: number|null }], subPrizes: { D?: [...], E?: [...], F?: [...] }, records: [{ timestamp, ticketId, grade, prizeName, subPrizeName?: string, lastOne?: true }] }`. The `subPrizes` field is the round-start snapshot of the configured variants — the running round's stock totals MUST NOT change when the admin edits the configuration mid-round. The `tickets` array order IS the shuffled pool order and MUST NOT be re-shuffled outside of round reset. The record for the pool's final ticket SHALL carry `lastOne: true`.

#### Scenario: State saved after draw
- **WHEN** a draw occurs
- **THEN** the drawn ticket's `drawn`/`drawnAt` fields and the appended record are persisted immediately

#### Scenario: Multi-draw persisted atomically
- **WHEN** a 5連抽 batch completes its fifth pick
- **THEN** all five ticket updates and their five records are persisted in a single localStorage write

#### Scenario: Pool order stable
- **WHEN** the game state is read back after any number of reloads
- **THEN** the ticket order and hidden grades are identical to when the round started

#### Scenario: Round snapshot isolates mid-round config edits
- **WHEN** the admin changes E賞's variants mid-round
- **THEN** the running round's sub-prize pool and stock are computed from the round's snapshot, unchanged until New Round

### Requirement: Legacy and malformed data reset
The system SHALL detect stored data that is neither version 2 nor version 3 (the v1 free-form schema or malformed JSON) and replace it with the default A–F configuration and a fresh pool, informing the user once that data was reset due to an upgrade. The system MUST NOT crash or render corrupt state when encountering legacy or malformed data.

#### Scenario: v1 data found
- **WHEN** the app loads and `ichibankuji_config` has no `version` field
- **THEN** config and game state are reinitialized to v3 defaults
- **AND** a one-time notice explains the reset
