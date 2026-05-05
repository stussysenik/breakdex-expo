#!/usr/bin/env bash
set -euo pipefail

echo "=== Typecheck ==="
bun run typecheck

echo "=== Lint ==="
bun run lint

echo "=== DB Migration Verification ==="
# Verify database module and migration files exist
for f in lib/database/index.ts lib/database/migrations.ts; do
  if [ ! -f "$f" ]; then echo "ERROR: $f not found"; exit 1; fi
done
# Verify DAG schema contains required tables
grep -q "CREATE TABLE IF NOT EXISTS entities" lib/database/index.ts || { echo "ERROR: entities table missing"; exit 1; }
grep -q "CREATE TABLE IF NOT EXISTS edges" lib/database/index.ts || { echo "ERROR: edges table missing"; exit 1; }
grep -q "CREATE TABLE IF NOT EXISTS practice_events" lib/database/index.ts || { echo "ERROR: practice_events table missing"; exit 1; }
grep -q "CREATE TABLE IF NOT EXISTS fsrs_cards" lib/database/index.ts || { echo "ERROR: fsrs_cards table missing"; exit 1; }
grep -q "PRAGMA user_version" lib/database/migrations.ts || { echo "ERROR: PRAGMA user_version check missing"; exit 1; }
grep -q "PRAGMA journal_mode = WAL" lib/database/migrations.ts || { echo "ERROR: WAL mode missing"; exit 1; }
echo "  ✓ All required tables and migrations present"

echo "=== Web Export ==="
bunx expo export --platform web

echo ""
echo "=== All checks passed ==="
