# App Structure Specification

## Overview

React Native Expo rewrite of breakdex-flutter with full feature parity.

## Technology Stack

| Component | Technology |
|----------|----------|
| Framework | Expo SDK 54 |
| State | Zustand |
| Database | expo-sqlite |
| Navigation | expo-router |
| Video | expo-av |
| Storage | AsyncStorage |

## Features Implemented

- Arsenal (moves CRUD)
- Review (FSRS algorithm)
- Stats (counts)
- Lab (placeholder)
- Settings (theme, sync)
- Move detail/create

## Flow Graph

Not implemented - requires canvas/graph library.

## Database Schema

```sql
moves: id, name, learningState, category, videoPath, notes, createdAt, archivedAt, archiveReason
combos: id, name, notes, createdAt
combo_moves: id, comboId, moveId, position
fsrs_cards: id, moveId, due, interval, easeFactor, repetitions, lapses, state
decks: id, name, createdAt
deck_moves: id, deckId, moveId
aura_links: id, fromMoveId, toMoveId, preset
```

## Deployment

- iOS: Expo / Xcode
- Web: expo-router web
- Local: Docker Compose