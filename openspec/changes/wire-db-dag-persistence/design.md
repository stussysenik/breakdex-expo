## Context

The breakdex-expo app currently has 13 working screens driven by XState v5 machines with in-memory state. A 277-line database layer (`lib/database/index.ts`) is fully coded but disconnected — every import of it is commented out with `// TODO`. Settings persist via AsyncStorage, but moves, combos, review history, and lab projects are lost on restart. The data model uses flat join tables (`combo_moves`, `deck_moves`) that can't express combos containing combos or moves belonging to multiple parents.

The `sync-downloads-branch` OpenSpec change merged two divergent branches and added IBM Carbon v11 design tokens. This change builds on that foundation to make the app functionally persistent and introduce DAG composition.

## Goals / Non-Goals

**Goals:**
- Replace flat join tables with a DAG entity graph (`entities` + `edges`) supporting many-to-many composition
- Wire XState machines to expo-sqlite so all CRUD persists across app restarts
- Add Sets as a first-class container entity (holds moves and combos)
- Add practice provenance — a per-entity event timeline of reviews, state changes, and notes
- Enable custom review sessions (select specific entities to review)
- Persist FSRS cards across sessions so spaced repetition accumulates history
- Remove dead Zustand stores that duplicate XState + DB logic

**Non-Goals:**
- Video capture/playback (columns exist in schema, UI left as placeholder)
- Cloud sync via Supabase (schema ready, sync logic deferred)
- Multi-device sync or CRDTs
- Combo editing (create/view/delete only in this pass)
- Deck system as a separate concept (Superseded by Sets)
- Migration of existing in-app data (there is none — all in-memory, nothing to migrate)

## Decisions

### Decision 1: DAG via adjacency list with typed edges

**Chosen**: Two-table model — `entities(id, type, name, data_json)` + `edges(parent_id, child_id, position, relation_type)`. A recursive CTE walks the graph for subtree queries. `relation_type` is an enum (`'contains'`, `'transitions_to'`) enabling future edge types without schema changes.

**Alternatives considered**:
- *Closure table*: Faster subtree reads at cost of O(n²) storage and complex inserts. Premature optimization for our scale (hundreds of entities).
- *JSON tree in a single column*: No queryability, no referential integrity.
- *Separate tables per entity type*: Rejected — the `entities` + `edges` model means Sets, Combos, and Moves all share the same graph logic. Adding a new entity type (e.g., `'drill'`) requires zero schema changes.

### Decision 2: expo-sqlite with tagged template API, no ORM

**Chosen**: Direct `expo-sqlite` usage with `db.sql\`\`` tagged templates, WAL journal mode, and `SQLiteProvider`/`useSQLiteContext` for React integration. The existing `lib/database/index.ts` is rewritten to use this API directly.

**Alternatives considered**:
- *Drizzle ORM*: Adds indirection, migration generation, and a build step. Our schema is simple enough (4 tables) that raw SQL is clearer.
- *Knex.js*: Query builder with its own dialect. Extra dependency for marginal benefit.
- *WatermelonDB*: Adds a complex sync protocol and observable layer we don't need yet.

### Decision 3: XState machines load from DB on mount

**Chosen**: Each machine's initial context is populated by `invoke`/`fromPromise` loading from SQLite. Write operations dispatch to the machine, which calls DB functions in `actions`. The DB layer remains a pure async module imported by machines, not a reactive observable.

**Alternatives considered**:
- *Reactive query layer (RxDB, Watermelon)*: Would require replacing XState machines with observable pipelines.
- *DB writes directly from UI*: Bypasses XState, breaking the state machine contract.

### Decision 4: practice_events table for provenance

**Chosen**: Single table `practice_events(entity_id, event_type, payload_json, created_at)` capturing both auto-events (review ratings from the review machine) and manual entries (user notes, milestones). `event_type` enum: `'reviewed'`, `'noted'`, `'state_change'`, `'created'`, `'archived'`. `payload` is JSON for flexibility (different event types have different shapes).

### Decision 5: Custom review via entity selection

**Chosen**: The review screen gains a pre-session picker that resolves selected entities to all descendant moves. Selecting a Set recursively expands all contained moves and combos. Selecting individual moves queues only those. The picker reads from the edges table with a recursive CTE.

## Risks / Trade-offs

- **[Data model migration]** Breaking change from flat tables to DAG. Mitigation: No production data exists — app is not launched. Schema migration via `user_version` PRAGMA.
- **[Recursive CTE performance]** On mobile SQLite. Mitigation: Our scale is hundreds of entities. CTE is measured in microseconds. If scale becomes thousands, add materialized subtree paths.
- **[JSON payload in practice_events]** No queryability on payload contents. Mitigation: `event_type` provides indexed filtering. Payload is for display, not search.
- **[XState + async DB]** Machines loading from DB on mount adds a loading state. Mitigation: SQLite reads are <1ms for our data size. The `appMachine` already handles loading/ready/error states.
- **[No composite unique index on edges]** Possible to insert duplicate edges. Mitigation: Application-level check in the edges write function, `UNIQUE(parent_id, child_id, relation_type)` constraint.

## Migration Plan

1. `lib/database/migrations.ts` checks `PRAGMA user_version`. If 0, runs new DAG schema DDL.
2. On first launch post-deploy: fresh database with `entities`, `edges`, `practice_events`, `fsrs_cards` tables.
3. Settings continue to use AsyncStorage (persisted, no migration needed).
4. No rollback needed — clean schema, no existing data.
