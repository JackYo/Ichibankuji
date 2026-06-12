# Specification: Sub-Prize Selection (子獎項自選)

## ADDED Requirements

### Requirement: Sub-prize pool presented after a sub-prized win
The system SHALL present a sub-prize pool UI immediately after the reveal of any drawn ticket whose grade has sub-prizes configured for the round. The pool SHALL list every variant of that grade with its name and remaining stock (remaining/total). The reveal itself MUST show only the parent grade and parent prize name — the variant is never disclosed or decided by the draw.

#### Scenario: Picker appears after revealing a sub-prized grade
- **WHEN** the player draws a ticket and the reveal shows "E賞" whose round configuration has four towel designs
- **THEN** after the reveal, a sub-prize pool is shown listing the four designs with each design's remaining stock

#### Scenario: No picker for single-item grades
- **WHEN** the player draws a ticket of a grade with no sub-prizes configured (e.g. A賞, or a D賞 left as a single item)
- **THEN** the reveal closes normally and no sub-prize pool is shown

### Requirement: Player chooses the variant manually
The system SHALL let the player claim exactly one variant per sub-prized win by tapping it in the sub-prize pool. The choice MUST be the player's — the system MUST NOT draw, randomize, or auto-assign a variant, including when only one variant remains in stock. Variants with zero remaining stock SHALL be visible but not selectable.

#### Scenario: Choosing a variant
- **WHEN** the sub-prize pool for an E賞 win shows designs 熊 3/5, 兔 5/5, 貓 0/5, 鴨 2/5
- **THEN** the player can tap 熊, 兔, or 鴨 to claim it, while 貓 is shown as out of stock and cannot be tapped

#### Scenario: Single variant left still requires an explicit pick
- **WHEN** only one variant of the grade has stock remaining
- **THEN** that variant is presented for the player to tap and is not claimed automatically

### Requirement: Stock depletion on selection
The system SHALL decrement the chosen variant's remaining stock by one at the moment of selection and persist the selection immediately. Remaining stock SHALL be derived from the round's records (configured variant quantity minus the count of selections of that variant), never stored as a separate counter. Because variant quantities sum exactly to the parent grade's ticket count, every sub-prized win SHALL always have at least one variant in stock.

#### Scenario: Stock decreases and persists
- **WHEN** the player claims 兔 (5/5 remaining)
- **THEN** 兔 immediately shows 4/5 remaining, and after a page reload it still shows 4/5

#### Scenario: Stock never runs dry before the wins do
- **WHEN** the final E賞 ticket's win reaches the sub-prize pool
- **THEN** exactly the unclaimed variants' stock remains and the player can complete the selection

### Requirement: Pending selections survive reload and gate further draws
The system SHALL treat any committed draw of a sub-prized grade that has no recorded variant choice as a pending selection. Pending selections SHALL be derived from the round's records, SHALL survive page reloads, and SHALL be presented for completion before the player can draw again. Drawing (single and 5連抽) MUST be blocked while any selection is pending.

#### Scenario: Reload before choosing
- **WHEN** the player draws an E賞 ticket, the draw is committed, and the page is reloaded before a variant was chosen
- **THEN** on load the sub-prize pool for that pending win is presented and the ticket pool does not accept new draws until the choice is made

#### Scenario: Drawing blocked while pending
- **WHEN** a pending selection exists
- **THEN** tapping a face-down ticket does not start a new draw and the UI directs the player to complete the pending selection

### Requirement: One selection per win in a 5連抽 batch
The system SHALL require one variant selection for each sub-prized win inside a 5連抽 batch. During the sequential reveal, each sub-prized result's pool SHALL be presented before advancing to the next result, in pick order.

#### Scenario: Mixed batch
- **WHEN** a 5連抽 reveals B賞, E賞, E賞, F賞, C賞 and E/F have sub-prizes configured
- **THEN** the player makes a variant choice after each E賞 reveal and after the F賞 reveal (three choices total), and the B賞/C賞 reveals advance without a choice

#### Scenario: Stock shown mid-batch reflects earlier picks in the same batch
- **WHEN** the player claims 熊 for the first E賞 win of the batch
- **THEN** the pool shown for the second E賞 win already shows 熊's stock reduced by that claim

### Requirement: Selection recorded in draw history
The system SHALL append the chosen variant name to the originating draw's history record, and the history panel SHALL display the variant alongside the parent grade and prize.

#### Scenario: History shows the variant
- **WHEN** the player claims 鴨 for an E賞 win
- **THEN** that draw's history row shows E賞, the parent prize name, and 鴨
