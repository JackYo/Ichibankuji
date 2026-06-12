# Delta: Lottery Draw — Sub-Prize Aware Reveal and History

## MODIFIED Requirements

### Requirement: Reveal presentation
The system SHALL present the drawn result with a ticket-opening reveal (flip or peel animation) showing the grade letter and the grade's prize content, with an option to close and continue drawing. For grades with sub-prizes configured, the reveal MUST show only the parent grade and parent prize content — never a variant — because the variant is chosen by the player afterwards, not by the draw.

#### Scenario: Reveal after pick
- **WHEN** a ticket is drawn
- **THEN** a reveal animation plays and a result view shows the grade (e.g., "B賞") and prize name
- **AND** the player can dismiss the result and return to the pool

#### Scenario: No variant leak on reveal
- **WHEN** a drawn ticket's grade has four sub-prize variants configured
- **THEN** the reveal shows only the grade letter and parent prize name, with no variant name or hint of which variants remain

### Requirement: Draw history recording
The system SHALL record each draw with a millisecond timestamp, the ticket id, the grade, and the prize content, and display the current round's history in draw order. When the player later claims a sub-prize variant for a draw, the variant name SHALL be appended to that record and shown in the history panel alongside the grade and prize. History SHALL persist across page reloads. All records for the current round are kept (no truncation).

#### Scenario: Record created on draw
- **WHEN** a ticket is drawn
- **THEN** a record { timestamp, ticketId, grade, prizeName } is appended to the round history
- **AND** the history panel updates immediately

#### Scenario: Record completed on variant claim
- **WHEN** the player claims variant 鴨 for an E賞 draw
- **THEN** that draw's record carries the variant name and the history row shows it next to the prize

#### Scenario: History survives reload
- **WHEN** the page is reloaded
- **THEN** the history panel shows the same records as before the reload
