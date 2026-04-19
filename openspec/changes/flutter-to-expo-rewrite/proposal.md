# Proposal: Flutter to Expo Rewrite

## Overview

Rewrite Breakdex from Flutter to Expo/React Native with full feature parity. Target local deployments (Railway, Fly.io) alongside iOS.

## Motivation

- Expo enables faster iteration and easier deployments
- Web/deployment flexibility with same codebase
- Cross-platform from single codebase (iOS + web)

## Scope

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

## Deployment Targets

- iOS (Expo/React Native)
- Web (expo-router web)
- Railway / Fly.io (containerized backend)

## Risks

- Large codebase rewrite — incremental required
- Animations need origami feel physics port
- SQLite schema migration needed