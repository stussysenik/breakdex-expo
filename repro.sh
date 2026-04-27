#!/usr/bin/env bash
set -euo pipefail

npm run build:runtime
npm run typecheck
npm run lint
npx expo export --platform web
