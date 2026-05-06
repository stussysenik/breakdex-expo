## ADDED Requirements

### Requirement: Practice events are recorded per entity
The system SHALL insert a row into `practice_events` for every review rating, learning state change, entity creation, archival, and user-added note. Each event SHALL have an `entity_id`, `event_type`, `payload` (JSON), and `created_at` timestamp.

#### Scenario: Review rating creates an event
- **WHEN** user rates a move as "Good" during review
- **THEN** a practice_event is inserted with `event_type = 'reviewed'`, `payload = { "rating": "good", "stability": 2.5, "difficulty": 0.3 }`, and `created_at = <now>`

#### Scenario: Manual note creates an event
- **WHEN** user adds a note "finally got the rotation clean" to a move
- **THEN** a practice_event is inserted with `event_type = 'noted'`, `payload = { "note": "finally got the rotation clean" }`

### Requirement: Practice history is queryable per entity
The system SHALL provide a function to retrieve all practice events for a given entity, ordered by `created_at` descending. The function SHALL support filtering by `event_type` and date range.

#### Scenario: View move practice history
- **WHEN** viewing a move detail screen
- **THEN** the system queries `SELECT * FROM practice_events WHERE entity_id = ? ORDER BY created_at DESC` and displays the timeline

#### Scenario: Filter practice history by event type
- **WHEN** user wants to see only review events for a move
- **THEN** the system queries with `WHERE entity_id = ? AND event_type = 'reviewed'`

### Requirement: Entity creation and state changes are auto-logged
The system SHALL automatically insert practice events when an entity is created, archived, or has its learning state changed. The XState machine action that performs the mutation SHALL also insert the corresponding practice event.

#### Scenario: Creating a move logs a creation event
- **WHEN** a new move is saved to the database
- **THEN** a practice_event with `event_type = 'created'` is inserted in the same transaction

#### Scenario: Learning state change during review is logged
- **WHEN** the review machine transitions a move from LEARNING to MASTERY
- **THEN** a practice_event with `event_type = 'state_change'`, `payload = { "from": "LEARNING", "to": "MASTERY" }` is inserted
