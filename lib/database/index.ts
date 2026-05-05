import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export function setDatabase(db: SQLite.SQLiteDatabase): void {
  _db = db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error("Database not initialized. Ensure SQLiteProvider wraps the app.");
  return _db;
}

export type EntityType = "move" | "combo" | "set" | "lab";

export type EntityRow = {
  id: string;
  type: EntityType;
  name: string;
  data: string;
  created_at: string;
  archived_at: string | null;
};

export type EdgeRow = {
  id: string;
  parent_id: string;
  child_id: string;
  position: number;
  relation_type: "contains" | "transitions_to";
};

export type PracticeEventRow = {
  id: string;
  entity_id: string;
  event_type: "reviewed" | "noted" | "state_change" | "created" | "archived";
  payload: string;
  created_at: string;
};

export type FsrsCardRow = {
  entity_id: string;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
};

function db(): SQLite.SQLiteDatabase {
  return getDatabase();
}

export function createSchema(database: SQLite.SQLiteDatabase) {
  database.execSync(`
    CREATE TABLE IF NOT EXISTS entities (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('move', 'combo', 'set', 'lab')),
      name TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      archived_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
    CREATE INDEX IF NOT EXISTS idx_entities_archived_at ON entities(archived_at);

    CREATE TABLE IF NOT EXISTS edges (
      id TEXT PRIMARY KEY NOT NULL,
      parent_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      relation_type TEXT NOT NULL CHECK(relation_type IN ('contains', 'transitions_to')),
      UNIQUE(parent_id, child_id, relation_type),
      FOREIGN KEY (parent_id) REFERENCES entities(id) ON DELETE CASCADE,
      FOREIGN KEY (child_id) REFERENCES entities(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_edges_parent ON edges(parent_id);
    CREATE INDEX IF NOT EXISTS idx_edges_child ON edges(child_id);
    CREATE INDEX IF NOT EXISTS idx_edges_relation_type ON edges(relation_type);

    CREATE TABLE IF NOT EXISTS practice_events (
      id TEXT PRIMARY KEY NOT NULL,
      entity_id TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK(event_type IN ('reviewed', 'noted', 'state_change', 'created', 'archived')),
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_practice_events_entity ON practice_events(entity_id);
    CREATE INDEX IF NOT EXISTS idx_practice_events_type ON practice_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_practice_events_created ON practice_events(created_at);

    CREATE TABLE IF NOT EXISTS fsrs_cards (
      entity_id TEXT PRIMARY KEY NOT NULL,
      state INTEGER NOT NULL DEFAULT 0,
      due TEXT NOT NULL,
      stability REAL NOT NULL DEFAULT 0,
      difficulty REAL NOT NULL DEFAULT 0,
      elapsed_days INTEGER NOT NULL DEFAULT 0,
      scheduled_days INTEGER NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL DEFAULT 0,
      lapses INTEGER NOT NULL DEFAULT 0,
      last_review TEXT,
      FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_fsrs_due ON fsrs_cards(due);
  `);
}

// ── Entity CRUD ─────────────────────────────────────────────────

export function getAllEntities(type?: EntityType): EntityRow[] {
  const d = db();
  if (type) {
    return d.getAllSync<EntityRow>(
      "SELECT * FROM entities WHERE type = ? AND archived_at IS NULL ORDER BY created_at DESC",
      [type],
    );
  }
  return d.getAllSync<EntityRow>(
    "SELECT * FROM entities WHERE archived_at IS NULL ORDER BY created_at DESC",
  );
}

export function getEntityById(id: string): EntityRow | null {
  const d = db();
  return d.getFirstSync<EntityRow>("SELECT * FROM entities WHERE id = ?", [id]);
}

export function insertEntity(
  id: string,
  type: EntityType,
  name: string,
  data: Record<string, unknown> = {},
): void {
  const d = db();
  d.runSync(
    "INSERT INTO entities (id, type, name, data, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, type, name, JSON.stringify(data), new Date().toISOString()],
  );
}

export function updateEntity(
  id: string,
  updates: { name?: string; data?: Record<string, unknown>; archived_at?: string | null },
): void {
  const d = db();
  const sets: string[] = [];
  const vals: (string | number | null)[] = [];

  if (updates.name !== undefined) { sets.push("name = ?"); vals.push(updates.name); }
  if (updates.data !== undefined) { sets.push("data = ?"); vals.push(JSON.stringify(updates.data)); }
  if (updates.archived_at !== undefined) { sets.push("archived_at = ?"); vals.push(updates.archived_at); }

  if (sets.length > 0) {
    vals.push(id);
    d.runSync(`UPDATE entities SET ${sets.join(", ")} WHERE id = ?`, vals);
  }
}

export function deleteEntity(id: string): void {
  const d = db();
  d.runSync("DELETE FROM entities WHERE id = ?", [id]);
}

export function archiveEntity(id: string): void {
  const d = db();
  d.runSync("UPDATE entities SET archived_at = ? WHERE id = ?", [
    new Date().toISOString(),
    id,
  ]);
}

// ── Edge CRUD ───────────────────────────────────────────────────

export function getEdges(parentId?: string, relationType?: string): EdgeRow[] {
  const d = db();
  if (parentId && relationType) {
    return d.getAllSync<EdgeRow>(
      "SELECT * FROM edges WHERE parent_id = ? AND relation_type = ? ORDER BY position",
      [parentId, relationType],
    );
  }
  if (parentId) {
    return d.getAllSync<EdgeRow>(
      "SELECT * FROM edges WHERE parent_id = ? ORDER BY position",
      [parentId],
    );
  }
  if (relationType) {
    return d.getAllSync<EdgeRow>(
      "SELECT * FROM edges WHERE relation_type = ? ORDER BY position",
      [relationType],
    );
  }
  return d.getAllSync<EdgeRow>("SELECT * FROM edges ORDER BY position");
}

export function getEdgesForParent(parentId: string): EdgeRow[] {
  return getEdges(parentId);
}

export function insertEdge(
  id: string,
  parentId: string,
  childId: string,
  relationType: "contains" | "transitions_to",
  position = 0,
): void {
  const d = db();
  d.runSync(
    "INSERT OR IGNORE INTO edges (id, parent_id, child_id, position, relation_type) VALUES (?, ?, ?, ?, ?)",
    [id, parentId, childId, position, relationType],
  );
}

export function deleteEdge(id: string): void {
  const d = db();
  d.runSync("DELETE FROM edges WHERE id = ?", [id]);
}

export function deleteEdgesForParent(parentId: string): void {
  const d = db();
  d.runSync("DELETE FROM edges WHERE parent_id = ?", [parentId]);
}

// ── Subtree resolver (recursive CTE) ───────────────────────────

export function resolveSubtree(parentId: string): EntityRow[] {
  const d = db();
  return d.getAllSync<EntityRow>(
    `WITH RECURSIVE subtree AS (
      SELECT e.*, 0 AS depth FROM entities e WHERE e.id = ?
      UNION ALL
      SELECT e.*, s.depth + 1
      FROM entities e
      JOIN edges ed ON ed.child_id = e.id
      JOIN subtree s ON s.id = ed.parent_id
      WHERE ed.relation_type = 'contains'
    )
    SELECT id, type, name, data, created_at, archived_at FROM subtree WHERE type = 'move'`,
    [parentId],
  );
}

// ── Practice Events ─────────────────────────────────────────────

export function getPracticeEvents(
  entityId: string,
  eventType?: string,
): PracticeEventRow[] {
  const d = db();
  if (eventType) {
    return d.getAllSync<PracticeEventRow>(
      "SELECT * FROM practice_events WHERE entity_id = ? AND event_type = ? ORDER BY created_at DESC",
      [entityId, eventType],
    );
  }
  return d.getAllSync<PracticeEventRow>(
    "SELECT * FROM practice_events WHERE entity_id = ? ORDER BY created_at DESC",
    [entityId],
  );
}

export function insertPracticeEvent(
  id: string,
  entityId: string,
  eventType: PracticeEventRow["event_type"],
  payload: Record<string, unknown> = {},
): void {
  const d = db();
  d.runSync(
    "INSERT INTO practice_events (id, entity_id, event_type, payload, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, entityId, eventType, JSON.stringify(payload), new Date().toISOString()],
  );
}

// ── FSRS Cards ──────────────────────────────────────────────────

export function getFsrsCard(entityId: string): FsrsCardRow | null {
  const d = db();
  return d.getFirstSync<FsrsCardRow>(
    "SELECT * FROM fsrs_cards WHERE entity_id = ?",
    [entityId],
  );
}

export function getAllFsrsCards(): FsrsCardRow[] {
  const d = db();
  return d.getAllSync<FsrsCardRow>("SELECT * FROM fsrs_cards");
}

export function upsertFsrsCard(card: {
  entity_id: string;
  state: number;
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
}): void {
  const d = db();
  d.runSync(
    `INSERT INTO fsrs_cards (entity_id, state, due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, last_review)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(entity_id) DO UPDATE SET
       state = excluded.state,
       due = excluded.due,
       stability = excluded.stability,
       difficulty = excluded.difficulty,
       elapsed_days = excluded.elapsed_days,
       scheduled_days = excluded.scheduled_days,
       reps = excluded.reps,
       lapses = excluded.lapses,
       last_review = excluded.last_review`,
    [
      card.entity_id, card.state, card.due, card.stability, card.difficulty,
      card.elapsed_days, card.scheduled_days, card.reps, card.lapses, card.last_review,
    ],
  );
}

export function createDefaultFsrsCard(entityId: string): void {
  upsertFsrsCard({
    entity_id: entityId,
    state: 0,
    due: new Date().toISOString(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    last_review: null,
  });
}

export function getDueCards(entityIds?: string[]): FsrsCardRow[] {
  const d = db();
  const now = new Date().toISOString();
  if (entityIds && entityIds.length > 0) {
    const placeholders = entityIds.map(() => "?").join(", ");
    return d.getAllSync<FsrsCardRow>(
      `SELECT fc.* FROM fsrs_cards fc
       JOIN entities e ON e.id = fc.entity_id
       WHERE e.archived_at IS NULL AND fc.due <= ? AND fc.entity_id IN (${placeholders})`,
      [now, ...entityIds],
    );
  }
  return d.getAllSync<FsrsCardRow>(
    `SELECT fc.* FROM fsrs_cards fc
     JOIN entities e ON e.id = fc.entity_id
     WHERE e.archived_at IS NULL AND fc.due <= ?`,
    [now],
  );
}
