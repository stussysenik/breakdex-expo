# Tasks

## Phase 1: Git Setup & Merge
- [ ] Task 1: Add Downloads repo as git remote (`git remote add downloads /Users/s3nik/Downloads/breakdex-expo`)
- [ ] Task 2: Fetch from downloads remote
- [ ] Task 3: Merge `downloads/main` into `main` (resolve conflicts: Downloads wins for app/ + lib/machines/ + lib/kernel/ + tamagui, Desktop wins for .opencode/ + .maestro/ + scripts/)
- [ ] Task 4: Verify merge looks right — 10 commits total in history

## Phase 2: Strip CLJS & Related
- [ ] Task 5: Remove `src/clj/` and `src/cljs/` dirs entirely
- [ ] Task 6: Remove `shadow-cljs.edn`, `deps.edn`, `deps.clj`, `build.clj`, `bsconfig.json`, `AppEntry.js`
- [ ] Task 7: Remove NativeWind: `tailwind.config.js`, `metro.config.js`, `nativewind-env.d.ts`, `babel.config.js`, `global.css`
- [ ] Task 8: Remove Carbon TS bridge: `lib/carbon/`, `lib/ui/carbon.tsx`, `scripts/build-carbon-tokens.mjs`
- [ ] Task 9: Remove legacy DSL: `lib/dsl/index.js`, `lib/screens/index.js`, `lib/design/tokens.js`
- [ ] Task 10: Remove legacy store: `lib/store/index.js`
- [ ] Task 11: Remove CSS tokens: `src/theme/carbon.css`, `src/theme/tokens.json`
- [ ] Task 12: Remove CLJS build caches: `.clj-kondo/`, `.lsp/`, `.cpcache/`, `.shadow-cljs/`, `target/`, `dist/`, `out/`
- [ ] Task 13: Remove empty dirs: `lib/features/`, `lib/core/`
- [ ] Task 14: Clean `package.json`: remove CLJS scripts, shadow-cljs/nativewind deps, update entry to `expo-router/entry`

## Phase 3: Integrate Tamagui + Carbon
- [ ] Task 15: Verify `tamagui.config.ts` is the canonical theme
- [ ] Task 16: Add IBM Carbon v11 design tokens as Tamagui theme extension (colors, spacing, typography)
- [ ] Task 17: Update `app/_layout.tsx` to wrap with TamaguiProvider + MachineProvider

## Phase 4: Verify
- [ ] Task 18: Run `npm install` to sync deps
- [ ] Task 19: Run `npm run typecheck` and fix errors
- [ ] Task 20: Run `npm run lint` and fix errors
- [ ] Task 21: Update `repro.sh` for new pipeline (remove CLJS steps)
- [ ] Task 22: Verify `repro.sh` passes
- [ ] Task 23: Commit result as "Merge downloads branch — pure TS/XState/Tamagui codebase"
