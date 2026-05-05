## Why

The app has working UI (13 screens, full SRS review flow, move/combat creation) and a fully-coded SQLite database layer (277 lines of CRUD), but the database is completely disconnected from the XState state machines. All data lives in-memory and vanishes on restart. Only settings persist (via AsyncStorage). The data model also limits composition: combo_moves is a flat join table that can't express combs containing combs, sets containing anything, or multiple-parent relationships. This change wires persistence and introduces a DAG data model so moves become reusable atoms and the app becomes actually usable.

## What Changes

- **Replace flat join tables with a DAG entity graph**: `entities(id, type, name, data)` + `edges(parent_id, child_id, position, relation_type)` — moves, combos, and sets all live in one table with typed, many-to-many relationships
- **Wire XState machines to SQLite**: `moveMachine`, `comboMachine`, `reviewMachine`, `flowMachine` load from and persist to `expo-sqlite` (tagged template API, WAL mode) — zero data loss on restart
- **Add Sets as a first-class entity**: a Set is a container/playlist that can hold moves and combs. New screen at `app/set/[id].tsx` and `app/set/create.tsx`
- **Add practice provenance**: `practice_events` table captures every review rating, state change, and optional manual note per entity — a Strava-style timeline
- **Add custom review sessions**: user selects specific moves, combs, or sets to review instead of the current "everything" default
- **Persist FSRS cards**: review history (intervals, ease factors, repetitions) survives app restart so spaced repetition actually works across sessions
- **Remove dead code**: delete unused Zustand stores (`moveStore`, `settingsStore`, `reviewStore`) that duplicate XState + DB logic
- **BREAKING**: Existing flat `moves`, `combos`, `combo_moves`, `decks`, `deck_moves` tables replaced by `entities` + `edges` graph model

## Capabilities

### New Capabilities
- `dag-entity-graph`: Entity graph data model (entities + typed edges) replacing flat join tables, supporting many-to-many composition where moves can belong to multiple combs and sets
- `persistence-layer`: SQLite wired to XState machines via SQLiteProvider/useSQLiteContext, with WAL mode, tagged template API, and migration support
- `practice-provenance`: Per-entity practice event timeline capturing review ratings, state changes, and manual notes
- `set-management`: Create, view, edit, and delete Sets — containers that can hold any combination of moves and combs
- `custom-review-sessions`: Select specific moves/combos/sets for review instead of reviewing everything unconditionally
- `fsrs-persistence`: FSRS cards (state, due, stability, difficulty, reps) persisted to SQLite and loaded on app start so spaced repetition accumulates history

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Database**: `lib/database/index.ts` rewritten from flat tables to DAG schema; new `lib/database/migrations.ts` for schema versioning
- **State machines**: `moveMachine`, `comboMachine`, `reviewMachine`, `flowMachine` gain load/persist actions; new `setMachine`
- **Screens**: New `app/set/create.tsx`, `app/set/[id].tsx`; modified `app/(tabs)/review.tsx` (entity picker for custom sessions), `app/move/create.tsx` (video capture placeholder removed, clearer MVP scope), `app/_layout.tsx` (add SQLiteProvider wrapping)
- **Removed**: `lib/store/moveStore.ts`, `lib/store/settingsStore.ts`, `lib/store/reviewStore.ts` (Zustand dead code)
- **Dependencies**: No new packages — `expo-sqlite` already installed; `@react-native-async-storage/async-storage` can migrate to `expo-sqlite/kv-store` optionally
