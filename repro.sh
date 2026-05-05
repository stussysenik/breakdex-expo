#!/usr/bin/env bash
set -euo pipefail

bun run typecheck
bun run lint
bunx expo export --platform web
