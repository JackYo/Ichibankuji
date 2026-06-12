# Specification: Sticker Board (賞品一覽 + 貼紙)

## ADDED Requirements

### Requirement: Prize board layout
The system SHALL display a prize board on the game page listing all six grades A賞–F賞 in order, each row/section showing the grade letter, the configured prize content, and one slot per ticket of that grade. Grades configured with quantity 0 SHALL be hidden from the board.

#### Scenario: Board reflects configuration
- **WHEN** the game page loads with configuration A賞×1 "Figure", B賞×3 "Mug", C–F×0
- **THEN** the board shows an A賞 row with 1 slot and a B賞 row with 3 slots
- **AND** grades C–F do not appear

### Requirement: Sticker pasted on claim
The system SHALL paste a sticker over one open slot of the corresponding grade whenever a ticket of that grade is drawn, with a visible paste animation. Stickers SHALL use a uniform shape color-coded by tier: gold for A賞–C賞 and silver for D賞–F賞. Sticker state SHALL be derived from the draw records (drawn count per grade), never stored separately.

#### Scenario: Sticker appears after draw
- **WHEN** a B賞 ticket is drawn
- **THEN** one previously open B賞 slot becomes covered by a gold sticker with a paste animation
- **AND** the number of stickered B賞 slots equals the number of B賞 draws this round

#### Scenario: Tier colors
- **WHEN** the board shows stickers for grades A–C and D–F
- **THEN** A賞–C賞 slots carry gold stickers and D賞–F賞 slots carry silver stickers

#### Scenario: Stickers survive reload
- **WHEN** the page is reloaded mid-round
- **THEN** the board shows exactly the same stickered slots as before the reload

### Requirement: Remaining-count visibility
The system SHALL show, per grade, the remaining count versus total (e.g., "B賞 2/3 remaining") so players can judge odds at a glance, mirroring how a real store board communicates remaining stock.

#### Scenario: Counts update on draw
- **WHEN** a grade's ticket is drawn
- **THEN** that grade's remaining count decreases by one on the board immediately

### Requirement: Fully claimed grade indication
The system SHALL visually mark a grade as sold out (all slots stickered) when its remaining count reaches zero.

#### Scenario: Grade sold out
- **WHEN** the last ticket of A賞 is drawn
- **THEN** the A賞 row shows all slots stickered and a sold-out treatment

### Requirement: Last One prize row
The board SHALL include a dedicated Last One 賞 row showing the configured Last One prize content. Its state SHALL be derived from pool emptiness: unclaimed while any ticket remains, and claimed (with a distinctive treatment) once the final ticket has been drawn.

#### Scenario: Last One pending
- **WHEN** at least one face-down ticket remains
- **THEN** the Last One row shows the prize content in an unclaimed state

#### Scenario: Last One claimed
- **WHEN** the final ticket is drawn
- **THEN** the Last One row switches to a claimed treatment in the same update as the final sticker paste
