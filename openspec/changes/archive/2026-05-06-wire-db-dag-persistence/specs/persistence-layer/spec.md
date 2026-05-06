## ADDED Requirements

### Requirement: Database is initialized on app launch
The system SHALL initialize an expo-sqlite database with WAL journal mode on app launch using `SQLiteProvider`. The database SHALL run schema migrations via `onInit` callback, checking `PRAGMA user_version` to determine if DDL is needed.

#### Scenario: First launch creates schema
- **WHEN** app launches with no existing database
- **THEN** `PRAGMA user_version` returns 0 and the migration function creates `entities`, `edges`, `practice_events`, and `fsrs_cards` tables with all indexes and constraints

#### Scenario: Subsequent launch skips migration
- **WHEN** app launches with an existing database where `user_version >= 1`
- **THEN** no DDL is executed and the database opens immediately

### Requirement: XState machines load initial state from database
The system SHALL populate each XState machine's initial context from the SQLite database during the provider's mount phase. Each machine SHALL use `fromPromise` invoke to load its data asynchronously, transitioning through loading states.

#### Scenario: Move machine loads moves on mount
- **WHEN** MachineProvider mounts
- **THEN** moveMachine invokes a loader that queries `SELECT * FROM entities WHERE type = 'move' AND archived_at IS NULL` and populates `context.moves`

#### Scenario: Combo machine loads combos on mount
- **WHEN** MachineProvider mounts
- **THEN** comboMachine invokes a loader that queries all combo entities with their child move edges

### Requirement: Write operations persist to database
The system SHALL execute SQLite INSERT/UPDATE/DELETE operations within XState action functions. Every state-changing event that modifies entities or edges SHALL include a corresponding database write.

#### Scenario: Creating a move persists immediately
- **WHEN** user submits the move creation form
- **THEN** moveMachine dispatches ADD_MOVE, which inserts into `entities` and returns the new row ID, updating context with the persisted entity

#### Scenario: Archiving a move updates the database
- **WHEN** user archives a move from the detail screen
- **THEN** moveMachine dispatches ARCHIVE_MOVE, which updates `entities SET archived_at = <now>` for that entity

### Requirement: Database errors surface to the error state
The system SHALL catch database errors in machine actions and transition to an error state with a user-visible message, rather than crashing silently.

#### Scenario: DB write failure shows error
- **WHEN** a database INSERT fails (e.g., constraint violation)
- **THEN** the machine transitions to an error state and the UI shows "Could not save. Tap to retry."
