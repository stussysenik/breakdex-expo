## ADDED Requirements

### Requirement: FSRS cards are stored in the database
The system SHALL store FSRS card state in a `fsrs_cards` table with columns `entity_id`, `state`, `due`, `stability`, `difficulty`, `elapsed_days`, `scheduled_days`, `reps`, `lapses`, `last_review`. Each entity SHALL have at most one FSRS card.

#### Scenario: New move gets a default FSRS card
- **WHEN** a new move entity is created
- **THEN** a default FSRS card is inserted with `state = 'New'`, `due = <now>`, `stability = 0`, `difficulty = 0`

#### Scenario: Review updates an existing FSRS card
- **WHEN** user rates a move during review
- **THEN** the corresponding FSRS card row is updated with new state, due date, stability, difficulty, and incremented reps

### Requirement: FSRS cards are loaded on app start
The system SHALL load all FSRS cards from the database when the review machine initializes. Cards SHALL be indexed by `entity_id` for O(1) lookup during review sessions.

#### Scenario: Load FSRS cards on mount
- **WHEN** the review machine initializes
- **THEN** it queries `SELECT * FROM fsrs_cards` and populates the card map

#### Scenario: Review history survives app restart
- **WHEN** user closes and reopens the app
- **THEN** previously reviewed moves retain their FSRS state (stability, difficulty, due date, reps) from the prior session

### Requirement: Due cards query filters by selected entities
The system SHALL provide a query that returns only FSRS cards that are both due (`due <= now`) and belong to entities in a provided set of entity IDs.

#### Scenario: Query due cards for selected entities
- **WHEN** querying `SELECT * FROM fsrs_cards WHERE entity_id IN (?, ?, ?) AND due <= ?`
- **THEN** only due cards for the specified entities are returned
