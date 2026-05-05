## 1. Database Layer — DAG Schema + Migrations

- [x] 1.1 Rewrite `lib/database/index.ts` with DAG schema: `entities`, `edges`, `practice_events`, `fsrs_cards` tables with all indexes and constraints
- [x] 1.2 Create `lib/database/migrations.ts` with versioned migration runner checking `PRAGMA user_version`
- [x] 1.3 Wire `SQLiteProvider` into `app/_layout.tsx` with `databaseName`, `onInit=migrate`, and optional `useSuspense`
- [x] 1.4 Export typed CRUD functions: `getAllEntities(type)`, `insertEntity`, `updateEntity`, `deleteEntity`, `archiveEntity`, `getEdges`, `insertEdge`, `deleteEdge`, `resolveSubtree(parentId)`, `getPracticeEvents`, `insertPracticeEvent`, `getFsrsCard`, `upsertFsrsCard`, `getDueCards(entityIds)`

## 2. Wire XState Machines to Database

- [x] 2.1 Refactor `moveMachine.ts` to load from DB on mount (`fromPromise`), persist on ADD_MOVE/UPDATE_MOVE/ARCHIVE_MOVE/DELETE_MOVE/CHANGE_STATE, and log practice events
- [x] 2.2 Refactor `comboMachine.ts` to load from DB on mount, persist on CREATE_COMBO/DELETE_COMBO, and query edges for combo-move relationships
- [x] 2.3 Refactor `flowMachine.ts` to load aura links (`relation_type = 'transitions_to'`) from DB on mount and persist on CREATE_LINK/DELETE_LINK
- [x] 2.4 Refactor `labMachine.ts` to load lab projects from DB on mount and persist on CREATE_PROJECT/ADD_TO_PROJECT
- [x] 2.5 Update `MachineContext.tsx` to ensure all `send` references use the new actor types with loaded data, add error boundary for DB failures

## 3. Practice Provenance

- [x] 3.1 Implement `insertPracticeEvent()` in database layer called from machine actions (move created, state changed, review rated, note added)
- [x] 3.2 Add practice timeline to `app/move/[id].tsx` detail screen: query practice events for the move, display chronologically with event type icons
- [x] 3.3 Add manual note entry to move detail: text input that inserts a `practice_event` with `event_type = 'noted'`

## 4. Sets — Entity Management

- [x] 4.1 Create `lib/machines/setMachine.ts` with XState v5 machine for Set CRUD: load sets from DB, create, add/remove entities, delete
- [x] 4.2 Create `app/set/create.tsx` — form with set name input, creates `type = 'set'` entity
- [x] 4.3 Create `app/set/[id].tsx` — detail screen showing contained moves and combos, add entity picker (reuse from combo create), remove entities
- [x] 4.4 Register Sets as a tab or accessible entry point in the Arsenal screen

## 5. Custom Review Sessions

- [x] 5.1 Add entity picker to `app/(tabs)/review.tsx` — pre-session modal allowing selection of moves, combos, and sets
- [x] 5.2 Implement `resolveSubtree()` call when a set or combo is selected, flattening to a set of move IDs
- [x] 5.3 Update `reviewMachine.ts` START_SESSION event to accept optional `entityIds` parameter and filter queue to only those entities
- [x] 5.4 Update review screen header to show selected scope (e.g., "Competition Prep · 5 moves")
- [x] 5.5 Preserve default behavior: when no entities selected, review all due non-archived moves

## 6. FSRS Card Persistence

- [x] 6.1 Update `reviewMachine.ts` to call `getFsrsCard()` on session start and `upsertFsrsCard()` on each rating
- [x] 6.2 Create default FSRS card on entity creation (in `insertEntity` or the machine action)
- [x] 6.3 Ensure `getDueCards()` filters by entity IDs and `due <= now` timestamp

## 7. Cleanup

- [x] 7.1 Delete `lib/store/moveStore.ts` (Zustand dead code)
- [x] 7.2 Delete `lib/store/settingsStore.ts` (Zustand dead code)
- [x] 7.3 Delete `lib/store/reviewStore.ts` (Zustand dead code)
- [x] 7.4 Remove Zustand from `package.json` if no remaining imports
- [ ] 7.5 Remove `@react-native-async-storage/async-storage` if settings migrate to `expo-sqlite/kv-store` (NOT YET: settingsMachine still uses AsyncStorage for persistence)

## 8. Verification

- [x] 8.1 Run `bun run typecheck` — fix all type errors
- [x] 8.2 Run `bun run lint` — fix all errors, preserve existing warnings
- [x] 8.3 Update `repro.sh` to include database migration verification step
- [x] 8.4 Run `repro.sh` — verify typecheck + lint + DB migration all pass (web export blocked by expo-sqlite WASM issue, pre-existing)
