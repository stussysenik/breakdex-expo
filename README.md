# Breakdex

> **A breakdancing move tracker for B-Boys and B-Girls**

Breakdex is a mobile app built with **Expo** and **React Native** that helps breakdancers track, review, and master their moves. Whether you're learning toprock or perfecting freezes, Breakdex has you covered.

## Features

- **Arsenal** — Catalog moves with categories, notes, and learning states (NEW → LEARNING → MASTERY)
- **Drill** — FSRS spaced-repetition review sessions with custom entity selection (pick specific moves, combos, or sets)
- **Sets** — Group moves and combos into themed containers (e.g., "Competition Prep")
- **Combos** — Chain moves into sequences with dot-line visual builder
- **Flow** — Visual move graph with aura links between transitions
- **Lab** — Kanban board for move projects (Idea → Attempting → Landed → Clean)
- **Battle** — Timed quiz mode with difficulty levels
- **Practice Timeline** — Per-move event history (reviews, state changes, notes) — like Strava for your vocabulary
- **Dark/Light theme** — IBM Carbon Design System tokens

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Expo (React Native) + Expo Router |
| **UI** | Tamagui + IBM Carbon v11 tokens |
| **State** | XState v5 (7 state machines) |
| **Persistence** | expo-sqlite (WAL mode, tagged templates) |
| **Data Model** | DAG entity graph — `entities` + typed `edges` table |
| **Review** | FSRS spaced repetition (kernel: `lib/kernel/fsrs.ts`) |
| **Language** | TypeScript (strict) |
| **Runtime** | Bun |
| **Lint** | ESLint |

## Project Structure

```
breakdex-expo/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/
│   │   ├── index.tsx             # Arsenal (moves list)
│   │   ├── review.tsx            # Drill (FSRS review sessions)
│   │   ├── flow.tsx              # Flow graph
│   │   ├── stats.tsx             # Progress analytics
│   │   ├── lab.tsx               # Lab kanban
│   │   └── settings.tsx          # App settings
│   ├── move/
│   │   ├── [id].tsx              # Move detail + practice timeline
│   │   └── create.tsx            # New move form
│   ├── combo/
│   │   ├── [id].tsx              # Combo detail
│   │   └── create.tsx            # Sequence builder
│   ├── set/
│   │   ├── [id].tsx              # Set detail with entity picker
│   │   └── create.tsx            # New set form
│   ├── battle.tsx                # Battle mode
│   └── _layout.tsx               # Root: SQLiteProvider → MachineProvider → TamaguiProvider → Stack
├── lib/
│   ├── context/
│   │   └── MachineContext.tsx    # XState provider + selector hooks
│   ├── database/
│   │   ├── index.ts              # DAG schema CRUD (entities, edges, practice_events, fsrs_cards)
│   │   └── migrations.ts         # Versioned migration runner (PRAGMA user_version)
│   ├── kernel/
│   │   ├── fsrs.ts               # Pure functional FSRS algorithm
│   │   └── learningState.ts      # Learning state transitions
│   ├── machines/
│   │   ├── moveMachine.ts        # Move CRUD + filter/search
│   │   ├── comboMachine.ts       # Combo CRUD + sequence builder
│   │   ├── setMachine.ts         # Set CRUD + entity containment
│   │   ├── reviewMachine.ts      # FSRS review session lifecycle
│   │   ├── flowMachine.ts        # Flow graph nodes + links
│   │   ├── labMachine.ts         # Lab kanban projects
│   │   ├── battleMachine.ts      # Timed quiz
│   │   ├── settingsMachine.ts    # Theme + preferences (AsyncStorage)
│   │   └── appMachine.ts         # Root navigation state
│   ├── carbon-tokens.ts          # IBM Carbon v11 design tokens
│   └── theme.ts                  # Tamagui theme from Carbon tokens
├── openspec/                     # Spec-driven development artifacts
│   └── changes/
│       └── wire-db-dag-persistence/
│           ├── proposal.md
│           ├── design.md
│           ├── specs/**/*.md
│           └── tasks.md
├── repro.sh                      # Verification: typecheck + lint + DB check
└── package.json
```

## Data Model

Breakdex uses a **DAG entity graph** — all content types share one table, relationships in another:

```
entities(id, type, name, data_json, created_at, archived_at)
edges(parent_id, child_id, position, relation_type)
practice_events(entity_id, event_type, payload_json, created_at)
fsrs_cards(entity_id, state, due, stability, difficulty, reps, lapses, last_review)
```

- **type** discriminates: `move`, `combo`, `set`, `lab`
- **edges** use `relation_type`: `contains` for hierarchy, `transitions_to` for flow
- A move can belong to 5 combos and 3 sets simultaneously — no parent lock-in
- Recursive CTE resolves all descendant moves from any combo or set

## Getting Started

### Prerequisites
- Node.js 18+
- Bun (`curl -fsSL https://bun.sh/install | bash`)
- Expo CLI

### Install & Run

```bash
git clone https://github.com/stussysenik/breakdex-expo.git
cd breakdex-expo
bun install
bun start
```

Press `i` for iOS simulator, `a` for Android, or scan QR with Expo Go.

### Verify

```bash
bash repro.sh
```

Runs `bun run typecheck`, `bun run lint`, and validates the database migration schema.

## Architecture

### State Management

XState v5 is the single orchestrator. 7 state machines manage app state:

- **moveMachine** — loads moves from DB on mount, persists on every mutation
- **comboMachine** — loads combos + edges, persists on create/delete
- **setMachine** — loads sets + edges, entity containment
- **reviewMachine** — FSRS session lifecycle, loads/saves cards to SQLite
- **flowMachine** — loads aura links (`transitions_to` edges)
- **labMachine** — lab projects loaded/persisted as entities
- **settingsMachine** — theme + preferences via AsyncStorage

All machines start in a `loading` state, invoke `fromPromise` to load from SQLite, then transition to `idle`. Write operations persist to SQLite in dedicated actions immediately after `assign`.

### Review System

FSRS (Free Spaced Repetition Scheduler) powers the Drill tab:
- Pure functional kernel in `lib/kernel/fsrs.ts`
- Cards persist across restarts via `fsrs_cards` table
- Custom review: select specific moves, combos, or sets before a session
- Recursive CTE resolves all descendant moves from selected combos/sets
- Review ratings logged as `practice_events` for timeline

## License

Private and proprietary. All rights reserved.

---

**Made with love for the breaking community**
