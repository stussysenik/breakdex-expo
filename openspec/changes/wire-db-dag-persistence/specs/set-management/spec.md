## ADDED Requirements

### Requirement: Users can create sets
The system SHALL allow users to create a Set entity with a name. Sets SHALL be stored as `entities` rows with `type = 'set'`.

#### Scenario: Create a new set
- **WHEN** user navigates to set creation and submits name "Competition Prep"
- **THEN** a new entity is created with `type = 'set'`, `name = 'Competition Prep'`

### Requirement: Users can add moves and combos to sets
The system SHALL allow users to add existing moves and combos to a set via an entity picker. Adding an entity SHALL insert an edge with `relation_type = 'contains'` from the set to the selected entity.

#### Scenario: Add moves to a set
- **WHEN** user opens "Competition Prep" set and selects moves "Windmill", "Flare", "Headspin" from the picker
- **THEN** three edges are inserted with `parent_id = <set_id>`, `child_id` values for each selected move, `relation_type = 'contains'`, and sequential `position` values

#### Scenario: Add a combo to a set
- **WHEN** user adds combo "Morning Flow" to "Competition Prep" set
- **THEN** an edge is inserted with `parent_id = <set_id>`, `child_id = <combo_id>`, `relation_type = 'contains'`

### Requirement: Users can view a set's contents
The system SHALL display all entities contained in a set, grouped by type (moves vs combos). The display SHALL show entity names and allow navigation to entity detail screens.

#### Scenario: View set contents
- **WHEN** user opens "Competition Prep" set detail screen
- **THEN** the system queries all edges WHERE parent_id = <set_id> and displays moves and combos in separate sections

### Requirement: Users can remove entities from sets
The system SHALL allow users to remove individual entities from a set by deleting the corresponding edge.

#### Scenario: Remove a move from a set
- **WHEN** user swipes to delete "Windmill" from "Competition Prep" set
- **THEN** the edge connecting that move to the set is deleted, but the move entity itself is NOT deleted

### Requirement: Users can delete sets
The system SHALL allow users to delete a set. Deleting a set SHALL remove all edges WHERE parent_id = <set_id>, then delete the set entity. Child entities (moves and combos) SHALL NOT be deleted.

#### Scenario: Delete an empty set
- **WHEN** user deletes "Competition Prep" set with no contents
- **THEN** the set entity row is deleted from `entities`

#### Scenario: Delete a set with contents
- **WHEN** user deletes "Competition Prep" set containing 3 moves
- **THEN** all edges with `parent_id = <set_id>` are deleted, the set entity is deleted, but the 3 move entities remain intact
