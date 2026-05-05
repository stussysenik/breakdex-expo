# Proposal: Sync Downloads Branch into Desktop

## Why

Two divergent branches of breakdex-expo exist with complementary work. Both share common ancestor `712e15e`. Desktop (+2 commits) has CLJS Carbon runtime + OpenCode + Maestro. Downloads (+8 commits) has XState + Tamagui + ReScript + FSRS + full routes. Merge into a pure Expo/TypeScript codebase — no ClojureScript.

## Git State

```
Desktop (main)                    Downloads (main)
  2016510 CLJS native build         e70c5dc Expo tunneling
  5f08a40 CLJS Carbon runtime       a339454 Dot-line flow UI
         \                        777e050 Enhanced screens
          \                      f05abc0 Graphics library
           \                    c0ee19c Saved progress
            \                 54079ef XState integration
             \               a8dadd3 Tamagui migration
              \             d065d9a BoxShadow styling
               \           /
                712e15e docs: docs
```

## Merge Strategy

**Git merge**, not cherry-pick. Resolve conflicts taking:
- **Downloads wins**: All `app/` routes, `lib/machines/`, `lib/kernel/`, `lib/context/`, `tamagui.config.ts`, `lib/theme.ts`
- **Desktop wins**: `.opencode/`, `.maestro/`, `repro.sh`, `eslint.config.js`, `scripts/fix-react-native-screens-ios.js`
- **Manual**: `package.json` (combine deps), `.gitignore` (merge rules)

## What Gets Removed (Post-Merge)

### CLJS Source (16 files — ~2,300 LOC)
- `src/clj/breakdex/app.cljs`
- `src/clj/breakdex/core.cljs`
- `src/clj/breakdex/screens.cljs`
- `src/clj/breakdex/uix.cljs`
- `src/clj/breakdex/design/tokens.cljs`
- `src/clj/breakdex/design/generated_tokens.cljs`
- `src/clj/breakdex/dsl/components.cljs`
- `src/clj/breakdex/platform/stack.cljs`
- `src/clj/breakdex/platform/storage.cljs`
- `src/clj/breakdex/state/store.cljs`
- `src/clj/breakdex/state/sample_data.cljs`
- `src/clj/breakdex/ui/carbon.cljs`
- `src/cljs/breakdex/rn_init.cljs`

### CLJS Build & Config (7 files)
- `shadow-cljs.edn`
- `deps.edn`
- `deps.clj`
- `build.clj`
- `bsconfig.json`
- `AppEntry.js` (CLJS entry → switch to `expo-router/entry`)
- `.clj-kondo/` (CLJS linter config)
- `.lsp/` (CLJS LSP config)
- `.cpcache/` (CLJS classpath cache)

### NativeWind Stack (5 files)
- `tailwind.config.js`
- `metro.config.js`
- `nativewind-env.d.ts`
- `babel.config.js`
- `global.css`

### Carbon TS Bridge (7 files — ~1,000 LOC)
- `lib/carbon/index.ts`
- `lib/carbon/components.tsx` (463 lines)
- `lib/carbon/theme.tsx` (109 lines)
- `lib/carbon/tokens.ts` (147 lines)
- `lib/carbon/package.json`
- `lib/ui/carbon.tsx`
- `scripts/build-carbon-tokens.mjs` (149 lines)

### Legacy DSL (2 files — ~762 LOC)
- `lib/dsl/index.js` (286 lines) — both repos have this, Downloads version superseded
- `lib/screens/index.js` (476 lines) — both repos have this, Downloads version superseded

### Legacy Store (1 file — 298 LOC)
- `lib/store/index.js` — superseded by TS Zustand stores + XState

### Theme Bridge (1 file)
- `lib/design/tokens.js` — superseded by Tamagui theme config

### Lib Cleanup
- `lib/features/` (5 empty dirs)
- `lib/core/` (empty dir)

### CSS Tokens
- `src/theme/carbon.css`
- `src/theme/tokens.json`

### NPM Deps to Remove
- `nativewind` + tailwind-related
- `shadow-cljs`
- `babel-plugin-nativewind` equivalent

## What Stays From Desktop

- `.opencode/` — 15+ files (agent config, skills, commands)
- `.maestro/` — 5 E2E test YAMLs (will need updating for Tamagui selectors)
- `repro.sh` — CI validation (will need CLJS steps removed)
- `eslint.config.js` — lint config
- `scripts/fix-react-native-screens-ios.js` — iOS postinstall fix
- `lib/database/index.ts` — DB schema (same in both repos)
- `lib/store/moveStore.ts`, `lib/store/reviewStore.ts`, `lib/store/settingsStore.ts` — Zustand stores

## What Comes From Downloads

- `lib/machines/` — 8 XState v5 machines (~1,545 LOC)
- `lib/context/MachineContext.tsx` — XState provider
- `lib/kernel/fsrs.ts` + `lib/kernel/learningState.ts` — FSRS algorithm
- `tamagui.config.ts` — Tamagui v4 config
- `src/rescript/Fsrs.res` + `src/rescript/LearningState.res` — ReScript FSRS
- All `app/` routes (13 files) — including battle, combo CRUD
- `lib/theme.ts` — Tamagui-compatible theme colors

## What Gets Added New

- Moonbit WASM kernel setup (future)
- Protobuf schema definitions
- IBM Carbon v11 design tokens as Tamagui theme extension

## Post-Merge Architecture

```
State:        XState v5 (machines) + Zustand 5 (lightweight stores)
UI:           Tamagui v2 RC + IBM Carbon v11 tokens
Routing:      expo-router v6 (13 routes)
Learning:     ReScript + TypeScript FSRS
Serialization: Protobuf
Performance:  Moonbit (future)
Testing:      Maestro E2E + repro.sh CI
```

## Impact
- ~3,800 LOC of CLJS + NativeWind + Carbon bridge removed
- ~2,500 LOC of XState + Tamagui + FSRS + routes from Downloads
- Git history preserved (8 commits from Downloads merged)
- Pure TypeScript/ReScript codebase
