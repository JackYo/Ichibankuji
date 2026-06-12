# Specification: Lottery Draw Mechanics (Ticket-Pool Draw)

## ADDED Requirements

### Requirement: Pre-shuffled ticket pool generation
The system SHALL generate the round's ticket pool by expanding the grade configuration (one ticket per unit of quantity, each tagged with its grade A–F), shuffling the pool once with a uniform shuffle (Fisher–Yates), and persisting the shuffled order to localStorage. Each ticket's grade SHALL be fixed from shuffle time onward.

#### Scenario: Pool created at round start
- **WHEN** a new round starts with configuration A賞×1, B賞×2, C賞×5
- **THEN** the system creates 8 tickets (1 A, 2 B, 5 C) in a shuffled order
- **AND** persists the shuffled pool to localStorage

#### Scenario: Ticket outcome stable across reloads
- **WHEN** the page is reloaded mid-round
- **THEN** the remaining face-down tickets keep the same hidden grades as before the reload

### Requirement: Player picks a specific ticket
The system SHALL display all undrawn tickets face-down in a visual pool, and the player SHALL draw by selecting a specific ticket. The system MUST NOT decide the outcome at click time; it reveals the grade pre-assigned to the selected ticket.

#### Scenario: Drawing a ticket
- **WHEN** the player taps a face-down ticket in the pool
- **THEN** that ticket is marked as drawn and removed from the face-down pool
- **AND** its pre-assigned grade and the configured prize content are revealed to the player

#### Scenario: Drawn tickets cannot be drawn again
- **WHEN** a ticket has been drawn
- **THEN** it no longer appears as a selectable face-down ticket

### Requirement: Reveal presentation
The system SHALL present the drawn result with a ticket-opening reveal (flip or peel animation) showing the grade letter and the grade's prize content, with an option to close and continue drawing.

#### Scenario: Reveal after pick
- **WHEN** a ticket is drawn
- **THEN** a reveal animation plays and a result view shows the grade (e.g., "B賞") and prize name
- **AND** the player can dismiss the result and return to the pool

### Requirement: Draw history recording
The system SHALL record each draw with a millisecond timestamp, the ticket id, the grade, and the prize content, and display the current round's history in draw order. History SHALL persist across page reloads. All records for the current round are kept (no truncation).

#### Scenario: Record created on draw
- **WHEN** a ticket is drawn
- **THEN** a record { timestamp, ticketId, grade, prizeName } is appended to the round history
- **AND** the history panel updates immediately

#### Scenario: History survives reload
- **WHEN** the page is reloaded
- **THEN** the history panel shows the same records as before the reload

### Requirement: Multi-draw mode (5連抽)
The system SHALL provide a draw-mode toggle between single draw (單抽) and five-ticket multi-draw (5連抽). In 5連抽 mode the player SHALL pick five distinct face-down tickets; no ticket is committed until the fifth pick, at which point all five are marked drawn, recorded, and persisted in a single atomic write, then revealed in pick order. The 5連抽 mode SHALL be selectable only while five or more tickets remain.

#### Scenario: Five-ticket batch draw
- **WHEN** the player activates 5連抽 and picks five face-down tickets
- **THEN** after the fifth pick all five tickets are marked drawn and five records are appended in one persisted update
- **AND** the five results are revealed sequentially in the order picked

#### Scenario: Abandoning a batch mid-pick
- **WHEN** the player has picked fewer than five tickets and leaves 5連抽 mode (or reloads the page)
- **THEN** no ticket is consumed and no record is created; all picked tickets return to the face-down pool

#### Scenario: Fewer than five tickets remain
- **WHEN** the remaining pool size drops below five
- **THEN** the 5連抽 mode is unavailable and only single draws are offered

### Requirement: Last One prize on the final ticket
The system SHALL award the configured Last One 賞 in addition to the ticket's own grade prize to the draw that takes the pool's final ticket, including when the final ticket is consumed within a 5連抽 batch. The final draw's history record SHALL carry a Last One marker.

#### Scenario: Final single draw
- **WHEN** the player draws the last remaining ticket
- **THEN** the reveal shows the ticket's grade prize followed by a celebration reveal of the Last One prize
- **AND** the record for that draw is flagged as the Last One winner

#### Scenario: Final ticket inside a multi-draw
- **WHEN** exactly five tickets remain and the player completes a 5連抽
- **THEN** the fifth revealed result additionally presents the Last One prize and its record carries the Last One flag

### Requirement: Pool exhaustion
The system SHALL indicate when all tickets have been drawn and offer "New Round" as the primary action; no further draws are possible until reset.

#### Scenario: Last ticket drawn
- **WHEN** the final face-down ticket is drawn
- **THEN** the pool area shows an empty/sold-out state
- **AND** the "New Round" action is promoted as the primary action

### Requirement: State persistence after each draw
The system SHALL persist the updated ticket pool and history to localStorage immediately after every draw.

#### Scenario: Persist on draw
- **WHEN** a draw completes
- **THEN** localStorage reflects the drawn ticket and new record before any further interaction is required
