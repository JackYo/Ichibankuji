# Specification: Admin Configuration Panel (A–F Grade Manager)

## ADDED Requirements

### Requirement: Password-protected access
The system SHALL require a password before granting access to the `/admin` page, validated against the hardcoded admin password. Authentication state SHALL be held in-memory only (cleared on page close, not persisted to localStorage).

#### Scenario: Unauthenticated visit
- **WHEN** a user navigates to /admin without having authenticated
- **THEN** a password form is shown and the editor is not accessible

#### Scenario: Successful login
- **WHEN** the correct password is submitted
- **THEN** the grade editor is shown for the rest of the page session

#### Scenario: Logout
- **WHEN** the admin clicks logout/back
- **THEN** authentication state is cleared and the user is navigated to /game
- **AND** returning to /admin requires the password again

### Requirement: Fixed A–F grade editor
The admin page SHALL present exactly six rows, one per grade A賞–F賞 in order. Each row SHALL allow editing the grade's prize content (name/description) and quantity. Grades MUST NOT be added, deleted, or reordered.

#### Scenario: Editor layout
- **WHEN** an authenticated admin opens the editor
- **THEN** six rows labeled A賞 through F賞 are shown, pre-filled with the current configuration

#### Scenario: Editing a tier
- **WHEN** the admin changes B賞's name to "Acrylic Stand" and quantity to 4
- **THEN** the form reflects the new values pending apply

### Requirement: Last One prize editor
The admin page SHALL provide a Last One 賞 section with an editable prize content (name) field, pre-filled with the current configuration.

#### Scenario: Editing the Last One prize
- **WHEN** the admin changes the Last One prize name to "Premium Figure" and applies a valid configuration
- **THEN** the saved configuration carries the new Last One prize name

### Requirement: Configuration validation
The system SHALL validate before applying: every grade with quantity > 0 MUST have a non-empty prize name; quantities MUST be integers ≥ 0; the total ticket count MUST be ≥ 1 and ≤ 200; the Last One prize name MUST be non-empty. Validation errors SHALL be shown per field and block the apply.

#### Scenario: Missing name on active grade
- **WHEN** the admin sets C賞 quantity to 2 but leaves its name empty and clicks "Apply Changes"
- **THEN** an error is shown on the C賞 row and the configuration is not saved

#### Scenario: Empty pool rejected
- **WHEN** all six grades have quantity 0 and the admin clicks "Apply Changes"
- **THEN** an error explains at least one ticket is required and nothing is saved

#### Scenario: Empty Last One name rejected
- **WHEN** the Last One prize name is blank and the admin clicks "Apply Changes"
- **THEN** an error is shown on the Last One field and the configuration is not saved

### Requirement: Apply changes for next round
The system SHALL save a valid configuration to localStorage (schema v2) with a confirmation message, and SHALL note that the new configuration takes effect when the next round starts; the current round's pool and stickers remain untouched.

#### Scenario: Successful apply
- **WHEN** a valid configuration is applied
- **THEN** it is persisted to localStorage with a v2 version marker and a timestamp
- **AND** a confirmation message states it applies from the next round

#### Scenario: Current round unaffected
- **WHEN** a configuration is applied mid-round
- **THEN** the game page's current ticket pool and sticker board do not change until "New Round" is confirmed

### Requirement: Total ticket count display
The admin editor SHALL display the live total ticket count (sum of all grade quantities) as the admin edits, so the pool size is always visible.

#### Scenario: Live total
- **WHEN** the admin changes any quantity field
- **THEN** the displayed total updates immediately
