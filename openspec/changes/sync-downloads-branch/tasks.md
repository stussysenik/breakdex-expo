# Tasks

## Phase 1: Git Setup & Merge
- [x] Task 1: Add Downloads repo as git remote (`git remote add downloads /Users/s3nik/Downloads/breakdex-expo`)
- [x] Task 2: Fetch from downloads remote
- [x] Task 3: Merge `downloads/main` into `main` (resolve conflicts: Downloads wins for app/ + lib/machines/ + lib/kernel/ + tamagui, Desktop wins for .opencode/ + .maestro/ + scripts/)
- [x] Task 4: Verify merge looks right — 10 commits total in history

## Phase 2: Strip CLJS & Related
- [x] Task 5: Remove `src/clj/` and `src/cljs/` dirs entirely
- [x] Task 6: Remove `shadow-cljs.edn`, `deps.edn`, `deps.clj`, `build.clj`, `bsconfig.json`, `AppEntry.js`
- [x] Task 7: Remove NativeWind: `tailwind.config.js`, `metro.config.js`, `nativewind-env.d.ts`, `babel.config.js`, `global.css`
- [x] Task 8: Remove Carbon TS bridge: `lib/carbon/`, `lib/ui/carbon.tsx`, `scripts/build-carbon-tokens.mjs`
- [x] Task 9: Remove legacy DSL: `lib/dsl/index.js`, `lib/screens/index.js`, `lib/design/tokens.js`
- [x] Task 10: Remove legacy store: `lib/store/index.js`
- [x] Task 11: Remove CSS tokens: `src/theme/carbon.css`, `src/theme/tokens.json`
- [x] Task 12: Remove CLJS build caches: `.clj-kondo/`, `.lsp/`, `.cpcache/`, `.shadow-cljs/`, `target/`, `dist/`, `out/`
- [x] Task 13: Remove empty dirs: `lib/features/`, `lib/core/`
- [x] Task 14: Clean `package.json`: remove CLJS scripts, shadow-cljs/nativewind deps, update entry to `expo-router/entry`

## Phase 3: Integrate Tamagui + Carbon
- [x] Task 15: Verify `tamagui.config.ts` is the canonical theme
- [x] Task 16: Add IBM Carbon v11 design tokens as Tamagui theme extension (colors, spacing, typography)
- [x] Task 17: Update `app/_layout.tsx` to wrap with TamaguiProvider + MachineProvider

## Phase 4: Verify
- [x] Task 18: Run `npm install` to sync deps
- [x] Task 19: Run `npm run typecheck` and fix errors
- [x] Task 20: Run `npm run lint` and fix errors
- [x] Task 21: Update `repro.sh` for new pipeline (remove CLJS steps)
- [x] Task 22: Verify `repro.sh` passes
- [x] Task 23: Commit result as "Merge downloads branch — pure TS/XState/Tamagui codebase"
