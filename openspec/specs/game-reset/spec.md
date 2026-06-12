# Specification: Game Round Reset (Reshuffle)

## Requirements

### Requirement: New Round action with confirmation
The game page SHALL provide an always-accessible "New Round" button that opens a confirmation dialog warning that the current round's pool, stickers, and history will be lost, with Cancel and Confirm options. Cancel SHALL leave all state untouched.

#### Scenario: Confirmation required
- **WHEN** the user clicks "New Round"
- **THEN** a confirmation dialog warns about data loss before anything is cleared

#### Scenario: Cancel is safe
- **WHEN** the user cancels the dialog
- **THEN** the pool, sticker board, and history are unchanged

### Requirement: Reset regenerates and reshuffles the pool
On confirmation, the system SHALL load the latest applied configuration, generate a brand-new ticket pool from it, reshuffle it, clear all draw records, and persist the fresh state. The sticker board SHALL render fully open (no stickers) afterwards.

#### Scenario: Reset with pending configuration
- **WHEN** the admin applied a new configuration mid-round and the user confirms "New Round"
- **THEN** the new round's pool reflects the new grade quantities and contents

#### Scenario: Reshuffle on every reset
- **WHEN** a round is reset with an unchanged configuration
- **THEN** a newly shuffled pool is generated (ticket outcomes are independent of the previous round)

#### Scenario: Board cleared
- **WHEN** the reset completes
- **THEN** the sticker board shows zero stickers and full remaining counts
- **AND** the Last One 賞 row returns to its unclaimed state

### Requirement: Reset feedback and error handling
The system SHALL close the dialog and show a success confirmation after reset; if persisting the reset fails, it SHALL show an error, keep the previous state, and allow retry.

#### Scenario: Successful reset
- **WHEN** the reset persists successfully
- **THEN** the dialog closes and a success message is shown over the fresh board

#### Scenario: Failed reset
- **WHEN** persisting the reset state fails
- **THEN** an error is shown and the previous round's state remains intact
