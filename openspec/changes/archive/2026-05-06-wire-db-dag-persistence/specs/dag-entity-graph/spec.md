## ADDED Requirements

### Requirement: Entity graph stores all content types
The system SHALL store moves, combos, and sets in a single `entities` table with a `type` discriminator column. Each entity SHALL have a unique UUID `id`, a `name`, a `type` value of `'move'` | `'combo'` | `'set'`, and a `data` JSON column for type-specific fields.

#### Scenario: Create a move entity
- **WHEN** user creates a new move with name "Windmill" and category "power"
- **THEN** a row is inserted into `entities` with `type = 'move'`, `name = 'Windmill'`, and `data` containing `{ "category": "power", "notes": "", "videoPath": null, "learningState": "NEW" }`

#### Scenario: Create a combo entity
- **WHEN** user creates a combo named "Morning Flow"
- **THEN** a row is inserted with `type = 'combo'` and `data` containing `{ "notes": "" }`

### Requirement: Typed edges express relationships between entities
The system SHALL store all entity relationships in an `edges` table with columns `parent_id`, `child_id`, `position`, and `relation_type`. The `relation_type` column SHALL accept values `'contains'` for hierarchical composition and `'transitions_to'` for flow graph connections.

#### Scenario: Add a move to a combo
- **WHEN** user adds move "Windmill" at position 3 in combo "Morning Flow"
- **THEN** an edge is inserted with `parent_id = <combo_id>`, `child_id = <move_id>`, `position = 3`, `relation_type = 'contains'`

#### Scenario: Add a combo to a set
- **WHEN** user adds combo "Morning Flow" to set "Competition Prep"
- **THEN** an edge is inserted with `parent_id = <set_id>`, `child_id = <combo_id>`, `relation_type = 'contains'`

### Requirement: Moves can belong to multiple parents
The system SHALL allow any entity to have multiple parent edges. A single move SHALL be referenceable by multiple combos and multiple sets simultaneously through separate edges.

#### Scenario: Move used in two combos
- **WHEN** move "Windmill" is added to both "Morning Flow" and "Power Set" combos
- **THEN** two edges exist with `child_id = <windmill_id>` and different `parent_id` values

### Requirement: Recursive queries resolve entity trees
The system SHALL provide a function to resolve all descendant entities from any parent node using a recursive CTE. The query SHALL return entities ordered by `position` within their direct parent.

#### Scenario: Resolve all moves in a set
- **WHEN** querying "Competition Prep" set that contains combo "Morning Flow" which contains move "Windmill"
- **THEN** the recursive CTE returns [Windmill] at depth 2 from the set root

#### Scenario: Resolve moves in an empty set
- **WHEN** querying a set with no children
- **THEN** the query returns an empty result set
