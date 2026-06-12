# Delta: Admin Configuration — Sub-Prize Variant Editor

## ADDED Requirements

### Requirement: Sub-prize variant editor for D/E/F grades
The admin editor SHALL provide, on each of the D賞/E賞/F賞 rows only, an expandable sub-prize section where the admin can add, edit, and remove variant rows (`name`, `quantity`). The section SHALL display a live sub-total of variant quantities next to the parent grade's quantity so the admin can see at a glance whether they match. Leaving a grade with zero variant rows keeps it a single-item grade. A賞–C賞 SHALL NOT offer a sub-prize section.

#### Scenario: Adding variants to E賞
- **WHEN** the admin expands E賞's sub-prize section and adds four rows 熊×5, 兔×5, 貓×5, 鴨×5 with E賞 quantity 20
- **THEN** the section shows the four rows and a sub-total of 20/20

#### Scenario: Removing a variant row
- **WHEN** the admin removes the 貓 row
- **THEN** the sub-total updates to 15/20 immediately

#### Scenario: High tiers stay single-item
- **WHEN** the admin views the A賞, B賞, or C賞 rows
- **THEN** no sub-prize section is offered

## MODIFIED Requirements

### Requirement: Configuration validation
The system SHALL validate before applying: every grade with quantity > 0 MUST have a non-empty prize name; quantities MUST be integers ≥ 0; the total ticket count MUST be ≥ 1 and ≤ 200; the Last One prize name MUST be non-empty. For each D/E/F grade that has one or more sub-prize variants: every variant MUST have a non-empty name and an integer quantity ≥ 1, and the variant quantities MUST sum exactly to the parent grade's quantity. A grade with quantity 0 MUST NOT have variants. Validation errors SHALL be shown per field and block the apply.

#### Scenario: Missing name on active grade
- **WHEN** the admin sets C賞 quantity to 2 but leaves its name empty and clicks "Apply Changes"
- **THEN** an error is shown on the C賞 row and the configuration is not saved

#### Scenario: Empty pool rejected
- **WHEN** all six grades have quantity 0 and the admin clicks "Apply Changes"
- **THEN** an error explains at least one ticket is required and nothing is saved

#### Scenario: Empty Last One name rejected
- **WHEN** the Last One prize name is blank and the admin clicks "Apply Changes"
- **THEN** an error is shown on the Last One field and the configuration is not saved

#### Scenario: Variant sum mismatch rejected
- **WHEN** E賞 quantity is 20 but its variants sum to 15 and the admin clicks "Apply Changes"
- **THEN** an error on the E賞 sub-prize section states the variant total must equal 20 and the configuration is not saved

#### Scenario: Unnamed variant rejected
- **WHEN** a variant row has quantity 5 but an empty name
- **THEN** an error is shown on that variant row and the configuration is not saved

### Requirement: Apply changes for next round
The system SHALL save a valid configuration to localStorage (schema v3) with a confirmation message, and SHALL note that the new configuration takes effect when the next round starts; the current round's pool, stickers, and sub-prize stock remain untouched.

#### Scenario: Successful apply
- **WHEN** a valid configuration is applied
- **THEN** it is persisted to localStorage with a v3 version marker and a timestamp
- **AND** a confirmation message states it applies from the next round

#### Scenario: Current round unaffected
- **WHEN** a configuration is applied mid-round
- **THEN** the game page's current ticket pool, sticker board, and sub-prize remaining stock do not change until "New Round" is confirmed
