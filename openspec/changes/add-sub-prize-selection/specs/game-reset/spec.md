# Delta: Game Reset — Sub-Prize Snapshot and Cleanup

## MODIFIED Requirements

### Requirement: Reset regenerates and reshuffles the pool
On confirmation, the system SHALL load the latest applied configuration, generate a brand-new ticket pool from it, reshuffle it, snapshot the configuration's D/E/F sub-prize variants into the fresh round state, clear all draw records (including every variant selection and any pending selections), and persist the fresh state. The sticker board SHALL render fully open (no stickers) afterwards and every variant's stock SHALL be back at its full snapshot quantity.

#### Scenario: Reset with pending configuration
- **WHEN** the admin applied a new configuration mid-round and the user confirms "New Round"
- **THEN** the new round's pool reflects the new grade quantities and contents
- **AND** the new round's sub-prize pools reflect the new variant lists at full stock

#### Scenario: Reshuffle on every reset
- **WHEN** a round is reset with an unchanged configuration
- **THEN** a newly shuffled pool is generated (ticket outcomes are independent of the previous round)

#### Scenario: Board cleared
- **WHEN** the reset completes
- **THEN** the sticker board shows zero stickers and full remaining counts
- **AND** the Last One 賞 row returns to its unclaimed state

#### Scenario: Pending selection wiped by reset
- **WHEN** a pending sub-prize selection exists and the user confirms "New Round"
- **THEN** the fresh round starts with no pending selections and drawing is immediately available
