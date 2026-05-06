# Spec: App Structure

## Tech Stack
- **Runtime**: Expo SDK 54 + React Native 0.81
- **Language**: TypeScript 5.9 + ReScript 11.1
- **State**: XState v5 (complex flows) + Zustand 5 (simple state)
- **UI**: Tamagui v2 RC + IBM Carbon tokens
- **Routing**: expo-router 6 (file-based)
- **DB**: expo-sqlite (local) + Supabase (cloud)
- **Learning**: FSRS v5 spaced repetition
- **Serialization**: Protobuf
- **Performance**: Moonbit (future WASM kernels)
- **Testing**: Maestro E2E + repro.sh CI
- **Agent**: OpenCode (.opencode/)

## Routes
```
app/
  _layout.tsx              # Root layout (TamaguiProvider)
  battle.tsx               # Battle screen
  (tabs)/
    _layout.tsx            # Tab navigator
    index.tsx              # Arsenal (main moves list)
    flow.tsx               # Combo builder
    review.tsx             # Session review
    stats.tsx              # Analytics
    lab.tsx                # Move laboratory
    settings.tsx           # App settings
  move/
    [id].tsx               # Move detail
    create.tsx             # Create move
  combo/
    [id].tsx               # Combo detail
    create.tsx             # Create combo
```

## State Machines (XState v5)
- `appMachine.ts` — App-level state (loading, ready, error)
- `battleMachine.ts` — Timed battle challenges
- `comboMachine.ts` — Combo CRUD + validation
- `flowMachine.ts` — Move-to-move transitions
- `labMachine.ts` — Achievements and milestones
- `moveMachine.ts` — Move CRUD
- `reviewMachine.ts` — FSRS review sessions
- `settingsMachine.ts` — App preferences

## Database Schema
- `moves` — name, category, difficulty, video_url, notes
- `combos` — name, description
- `combo_moves` — combo_id, move_id, position
- `fsrs_cards` — move_id, state, due, stability, difficulty, elapsed_days, scheduled_days, reps
- `decks` — name, category_ids
- `deck_moves` — deck_id, move_id
- `aura_links` — from_move_id, to_move_id, label, direction

## Design System
- Tamagui v2 RC as base UI component library
- IBM Carbon v11 design tokens (colors, spacing, typography) as Tamagui theme
- Constraint-based layout (Carbon 2x grid)
- Dark mode as first-class theme
