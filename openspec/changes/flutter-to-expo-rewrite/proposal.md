# Proposal: Flutter to Expo Rewrite

## Why

Rewrite Breakdex from Flutter to Expo/React Native with full feature parity. Target local deployments (Railway, Fly.io) alongside iOS.

- Expo enables faster iteration and easier deployments
- Web/deployment flexibility with same codebase
- Cross-platform from single codebase (iOS + web)

## What Changes

Full feature parity with breakdex-flutter:
- Arsenal (moves + combos)
- Flow graph (move-to-move transitions)
- Review (FSRS spaced repetition)
- Stats (analytics)
- Settings (theme, categories, sync)
- Lab (achievements, milestones)
- Battle (timed challenges)
- Move analysis (pose detection prototype)

## Architecture

- **State**: Zustand (from Riverpod)
- **Database**: expo-sqlite (from Drift/SQLite)
- **Navigation**: expo-router (from GoRouter)
- **Video**: expo-av
- **Animation**: react-native-reanimated + origami feel physics

## Impact

- iOS (Expo/React Native)
- Web (expo-router web)
- Railway / Fly.io (containerized backend)
- Native routing now centers on Expo Router tab screens and move detail routes
- Core move CRUD, review workspace, stats, lab, flow links, and settings are available in the Expo app shell
- Remaining gaps are graph-canvas visualization, richer animation polish, and any advanced parity items not yet ported
