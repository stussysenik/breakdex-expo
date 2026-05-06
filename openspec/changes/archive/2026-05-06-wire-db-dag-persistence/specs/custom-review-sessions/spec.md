## ADDED Requirements

### Requirement: Users can select entities for custom review
The system SHALL present an entity picker before starting a review session. The picker SHALL allow selecting individual moves, combos, and sets. Selecting a set or combo SHALL recursively include all descendant moves.

#### Scenario: Select individual moves for review
- **WHEN** user selects moves "Windmill" and "Flare" from the picker and starts review
- **THEN** the review session queues only those two moves

#### Scenario: Select a set for review
- **WHEN** user selects set "Competition Prep" (containing 5 moves via combos) and starts review
- **THEN** the review session recursively resolves all 5 descendant moves and queues them

#### Scenario: Select a combo for review
- **WHEN** user selects combo "Morning Flow" (containing 3 moves) and starts review
- **THEN** the review session resolves the 3 moves from the combo and queues them

### Requirement: Due cards filter respects custom selection
The system SHALL load FSRS cards from the database for all selected entities and filter to only due cards (where `due <= now`). Only due cards from the selected entities SHALL appear in the queue.

#### Scenario: Some selected moves are not due
- **WHEN** user selects 5 moves but only 3 have due FSRS cards
- **THEN** the review session queues only the 3 due moves

### Requirement: Default review behavior is unchanged when no selection
The system SHALL default to "review all due" when the user starts a session without making a selection. All non-archived moves with due FSRS cards SHALL be queued.

#### Scenario: Start review without entity selection
- **WHEN** user taps "Start Session" without selecting specific entities
- **THEN** all non-archived moves with due FSRS cards are queued

### Requirement: Review screen shows selected scope
The system SHALL display which entities are included in the current review session on the review screen. The display SHALL show the entity names or a count (e.g., "Reviewing 5 moves from Competition Prep").

#### Scenario: Display review scope for a set
- **WHEN** reviewing from set "Competition Prep" with 5 moves
- **THEN** the review screen header shows "Competition Prep · 5 moves"
